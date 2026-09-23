#!/usr/bin/env python3
"""Windows game-screen OCR translator. No game process or game files are modified."""
from __future__ import annotations

import csv
import html
import io
import json
import os
import queue
import shutil
import sqlite3
import subprocess
import sys
import threading
import time
import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def locate_tesseract() -> str | None:
    bundle = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    candidates = [
        str(bundle / "tesseract" / "tesseract.exe"),
        shutil.which("tesseract"),
        os.environ.get("TESSERACT_EXE"),
        str(Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Tesseract-OCR/tesseract.exe"),
        str(Path(os.environ.get("ProgramFiles(x86)", "C:/Program Files (x86)")) / "Tesseract-OCR/tesseract.exe"),
    ]
    executable = next((str(p) for p in candidates if p and Path(p).is_file()), None)
    if executable and (bundle / "tesseract" / "tessdata").is_dir():
        os.environ["TESSDATA_PREFIX"] = str(bundle / "tesseract" / "tessdata")
    return executable


def parse_tsv(tsv: str, min_confidence: int = 35) -> str:
    groups: dict[tuple[str, str, str], list[str]] = {}
    for row in csv.DictReader(io.StringIO(tsv), delimiter="\t"):
        word = (row.get("text") or "").strip()
        if not word:
            continue
        try:
            confidence = float(row.get("conf", "-1"))
        except ValueError:
            continue
        if confidence < min_confidence:
            continue
        key = (row["block_num"], row["par_num"], row["line_num"])
        groups.setdefault(key, []).append(word)
    return "\n".join(" ".join(words) for words in groups.values())


def recognize(image, executable: str, language: str = "eng") -> str:
    from PIL import ImageEnhance, ImageOps

    image = ImageOps.grayscale(image)
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageEnhance.Contrast(image).enhance(1.5)
    stream = io.BytesIO()
    image.save(stream, format="PNG")
    process = subprocess.run(
        [executable, "stdin", "stdout", "-l", language, "--psm", "6", "tsv"],
        input=stream.getvalue(), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        timeout=12, check=False, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    if process.returncode:
        raise RuntimeError("OCR çalışmadı: " + process.stderr.decode("utf-8", "replace")[-300:])
    return parse_tsv(process.stdout.decode("utf-8", "replace"))


OCR_CODES = {"eng": "en", "deu": "de", "fra": "fr", "spa": "es", "jpn": "ja", "kor": "ko", "chi_sim": "zh-CN"}


def translate_mymemory(text: str, language: str) -> str:
    if len(text.encode("utf-8")) > 480:
        raise ValueError("Metin 480 baytı aşıyor. Daha küçük bir altyazı alanı seçin.")
    query = urlencode({"q": text, "langpair": f"{OCR_CODES[language]}|tr"})
    request = Request("https://api.mymemory.translated.net/get?" + query,
                      headers={"User-Agent": "OyunEkraniCevirmen/2.0"})
    with urlopen(request, timeout=10) as response:
        result = json.load(response)
    if int(result.get("responseStatus", 0)) != 200:
        raise RuntimeError(result.get("responseDetails") or "MyMemory çeviri sınırı doldu")
    value = html.unescape(result.get("responseData", {}).get("translatedText", "")).strip()
    if not value:
        raise RuntimeError("MyMemory boş çeviri döndürdü")
    return value


def translated(text: str, language: str) -> str:
    try:
        return translate_mymemory(text, language)
    except Exception as first_error:
        from deep_translator import GoogleTranslator
        try:
            return GoogleTranslator(source="auto", target="tr").translate(text=text)
        except Exception as second_error:
            raise RuntimeError(
                "İki çeviri kaynağı da yanıt vermedi. Ücretsiz çeviri sınırına ulaşılmış olabilir. "
                f"MyMemory: {first_error}; Google: {second_error}"
            ) from second_error


def cache_path() -> Path:
    base = Path(os.environ.get("LOCALAPPDATA") or Path.home()) / "OyunEkraniCevirmen"
    base.mkdir(parents=True, exist_ok=True)
    return base / "ceviriler.sqlite3"


def self_test() -> int:
    from PIL import Image, ImageDraw, ImageFont

    executable = locate_tesseract()
    if not executable:
        return 2
    image = Image.new("RGB", (700, 120), "white")
    font_file = (Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / "arial.ttf")
    if not font_file.exists():
        font_file = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    font = ImageFont.truetype(str(font_file), 30)
    ImageDraw.Draw(image).text((18, 20), "Welcome to the game", fill="black", font=font)
    try:
        value = recognize(image, executable, "eng").lower()
    except Exception:
        return 3
    return 0 if "welcome" in value and "game" in value else 4


class AreaPicker(tk.Toplevel):
    def __init__(self, parent, callback, cancel):
        super().__init__(parent)
        self.callback = callback
        self.cancel = cancel
        self.start = None
        self.attributes("-topmost", True)
        self.attributes("-fullscreen", True)
        self.attributes("-alpha", 0.42)
        self.configure(bg="#070b15")
        self.canvas = tk.Canvas(self, bg="#070b15", highlightthickness=0, cursor="crosshair")
        self.canvas.pack(fill="both", expand=True)
        self.canvas.create_text(30, 30, text="Çevrilecek alanı sürükleyerek seçin · ESC: iptal", fill="white", anchor="nw", font=("Segoe UI", 17, "bold"))
        self.rect = None
        self.canvas.bind("<ButtonPress-1>", self.press)
        self.canvas.bind("<B1-Motion>", self.move)
        self.canvas.bind("<ButtonRelease-1>", self.release)
        self.bind("<Escape>", lambda _: self.cancel_pick())
        self.focus_force()

    def press(self, event):
        self.start = (event.x, event.y)
        if self.rect:
            self.canvas.delete(self.rect)
        self.rect = self.canvas.create_rectangle(event.x, event.y, event.x, event.y, outline="#41eead", width=3, fill="#343a61")

    def move(self, event):
        if self.start:
            self.canvas.coords(self.rect, *self.start, event.x, event.y)

    def release(self, event):
        if not self.start:
            return
        x1, y1 = self.start
        x2, y2 = event.x, event.y
        left, top = min(x1, x2), min(y1, y2)
        width, height = abs(x2 - x1), abs(y2 - y1)
        if width < 80 or height < 25:
            messagebox.showinfo("Alan küçük", "Metnin bulunduğu daha geniş bir alan seçin.")
            return
        self.destroy()
        self.callback((left, top, width, height))

    def cancel_pick(self):
        self.destroy()
        self.cancel()


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Oyun Ekranı Türkçe Çevirmen")
        self.geometry("610x390")
        self.minsize(540, 350)
        self.configure(bg="#161a28")
        self.region = None
        self.running = threading.Event()
        self.messages = queue.Queue()
        self.worker = None
        self.overlay = None
        self.previous_hotkey = False
        self.interval = tk.StringVar(value="2.0")
        self.language = tk.StringVar(value="eng")
        self.region_label = tk.StringVar(value="Henüz alan seçilmedi")
        self.status = tk.StringVar(value="Altyazı veya menü alanını seçerek başlayın.")
        self.setup_ui()
        self.after(100, self.process_messages)
        if sys.platform == "win32":
            self.after(120, self.watch_hotkey)
        self.protocol("WM_DELETE_WINDOW", self.exit_app)

    def setup_ui(self):
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background="#161a28")
        style.configure("TLabel", background="#161a28", foreground="#ecedf4", font=("Segoe UI", 10))
        style.configure("TButton", padding=8, font=("Segoe UI", 10))
        main = ttk.Frame(self, padding=22)
        main.pack(fill="both", expand=True)
        ttk.Label(main, text="Oyun Ekranı Çevirmeni", font=("Segoe UI", 19, "bold")).pack(anchor="w")
        ttk.Label(main, text="Ekrandaki yazıyı okur ve Türkçesini oyun üzerinde gösterir.").pack(anchor="w", pady=(4, 18))
        ttk.Button(main, text="1 · Çevrilecek alanı seç", command=self.pick_area).pack(fill="x")
        ttk.Label(main, textvariable=self.region_label).pack(anchor="w", pady=(7, 16))
        options = ttk.Frame(main)
        options.pack(fill="x")
        ttk.Label(options, text="Kontrol aralığı (sn):").pack(side="left")
        ttk.Combobox(options, textvariable=self.interval, values=("1.0", "1.5", "2.0", "3.0", "5.0"), state="readonly", width=6).pack(side="left", padx=(8, 25))
        ttk.Label(options, text="OCR dili:").pack(side="left")
        ttk.Combobox(options, textvariable=self.language, values=("eng", "deu", "fra", "spa", "jpn", "kor", "chi_sim"), state="readonly", width=9).pack(side="left", padx=8)
        self.toggle_button = ttk.Button(main, text="2 · Çeviriyi başlat (F8)", command=self.toggle)
        self.toggle_button.pack(fill="x", pady=(18, 8))
        ttk.Button(main, text="Çeviri katmanını kapat", command=self.close_overlay).pack(fill="x")
        ttk.Label(main, textvariable=self.status, wraplength=530).pack(anchor="w", pady=(18, 0))

    def pick_area(self):
        self.stop()
        self.close_overlay()
        self.withdraw()
        self.after(180, lambda: AreaPicker(self, self.area_selected, self.deiconify))

    def area_selected(self, region):
        self.region = region
        self.deiconify()
        self.lift()
        self.region_label.set(f"Alan: sol {region[0]}, üst {region[1]}, {region[2]} × {region[3]} piksel")
        self.status.set("Hazır. Oyunu kenarlıksız pencere modunda açıp F8'e basın.")

    def toggle(self):
        if self.running.is_set():
            self.stop()
            return
        if not self.region:
            self.status.set("Önce çevrilecek ekran alanını seçin.")
            return
        executable = locate_tesseract()
        if not executable:
            messagebox.showerror("Tesseract gerekli", "Tesseract OCR kurun ve yeniden deneyin. Kurulum bağlantısı OKU_BENI.txt içinde.")
            return
        try:
            import PIL.ImageGrab  # noqa: F401
            import deep_translator  # noqa: F401
        except ImportError:
            messagebox.showerror("Eksik bileşen", "Önce KUR.bat dosyasını çalıştırın.")
            return
        self.running.set()
        self.toggle_button.configure(text="Durdur (F8)")
        self.status.set("Ekrandaki yazı izleniyor…")
        self.worker = threading.Thread(target=self.run_loop, args=(self.region, executable, self.language.get(), float(self.interval.get())), daemon=True)
        self.worker.start()

    def stop(self):
        self.running.clear()
        self.toggle_button.configure(text="2 · Çeviriyi başlat (F8)")

    def run_loop(self, region, executable, language, interval):
        from PIL import ImageGrab

        previous = ""
        try:
            database = sqlite3.connect(cache_path())
            database.execute("CREATE TABLE IF NOT EXISTS translations (language TEXT NOT NULL, source TEXT NOT NULL, target TEXT NOT NULL, PRIMARY KEY (language, source))")
        except Exception as exc:
            self.messages.put(("error", "Çeviri önbelleği açılamadı: " + str(exc)))
            self.running.clear()
            return
        while self.running.is_set():
            start = time.monotonic()
            try:
                x, y, w, h = region
                image = ImageGrab.grab(bbox=(x, y, x + w, y + h), all_screens=True)
                text = recognize(image, executable, language).strip()
                # Ignore noise and avoid retranslating an unchanged subtitle.
                if len(text) >= 3 and any(c.isalpha() for c in text) and text != previous:
                    previous = text
                    row = database.execute("SELECT target FROM translations WHERE language=? AND source=?", (language, text)).fetchone()
                    if row:
                        value = row[0]
                    else:
                        value = translated(text, language)
                        database.execute("INSERT OR REPLACE INTO translations VALUES (?,?,?)", (language, text, value))
                        database.commit()
                    if self.running.is_set():
                        self.messages.put(("translation", value))
                elif not text and previous:
                    previous = ""
                    self.messages.put(("clear", ""))
            except Exception as exc:
                self.messages.put(("error", str(exc)))
                self.running.clear()
                database.close()
                return
            remaining = interval - (time.monotonic() - start)
            if remaining > 0:
                # Event.wait would return immediately while set; small sleeps permit stop.
                until = time.monotonic() + remaining
                while self.running.is_set() and time.monotonic() < until:
                    time.sleep(min(0.1, until - time.monotonic()))
        database.close()

    def show_translation(self, text):
        if self.overlay is None or not self.overlay.winfo_exists():
            self.overlay = tk.Toplevel(self)
            self.overlay.overrideredirect(True)
            self.overlay.attributes("-topmost", True)
            self.overlay.attributes("-alpha", 0.87)
            self.overlay.configure(bg="#11151c")
            self.caption = tk.Label(self.overlay, bg="#11151c", fg="#f6f6f8", font=("Segoe UI", 15, "bold"), justify="left", padx=14, pady=10, wraplength=800)
            self.caption.pack(fill="both", expand=True)
        x, y, w, h = self.region
        width = min(max(280, w), 900, self.winfo_screenwidth())
        self.caption.configure(text=text, wraplength=width - 28)
        self.overlay.update_idletasks()
        height = min(self.overlay.winfo_reqheight(), 240)
        screen_h = self.winfo_screenheight()
        # Place outside the captured rectangle so OCR does not translate its own overlay.
        top = y + h + 8 if y + h + height + 8 <= screen_h else max(0, y - height - 8)
        left = min(x, max(0, self.winfo_screenwidth() - width))
        self.overlay.geometry(f"{width}x{height}+{left}+{top}")
        self.overlay.deiconify()
        if sys.platform == "win32":
            self.make_clickthrough()

    def make_clickthrough(self):
        try:
            import ctypes
            from ctypes import wintypes
            user32 = ctypes.windll.user32
            user32.GetAncestor.argtypes = (wintypes.HWND, wintypes.UINT)
            user32.GetAncestor.restype = wintypes.HWND
            hwnd = user32.GetAncestor(self.overlay.winfo_id(), 2)  # GA_ROOT
            GWL_EXSTYLE, WS_EX_TRANSPARENT, WS_EX_LAYERED = -20, 0x20, 0x80000
            get_style = user32.GetWindowLongPtrW if ctypes.sizeof(ctypes.c_void_p) == 8 else user32.GetWindowLongW
            set_style = user32.SetWindowLongPtrW if ctypes.sizeof(ctypes.c_void_p) == 8 else user32.SetWindowLongW
            get_style.argtypes = (wintypes.HWND, ctypes.c_int)
            set_style.argtypes = (wintypes.HWND, ctypes.c_int, ctypes.c_ssize_t)
            get_style.restype = ctypes.c_ssize_t
            set_style.restype = ctypes.c_ssize_t
            style = get_style(hwnd, GWL_EXSTYLE)
            set_style(hwnd, GWL_EXSTYLE, style | WS_EX_TRANSPARENT | WS_EX_LAYERED)
        except (AttributeError, OSError):
            pass

    def close_overlay(self):
        if self.overlay is not None:
            self.overlay.destroy()
            self.overlay = None

    def process_messages(self):
        try:
            while True:
                kind, value = self.messages.get_nowait()
                if kind == "translation" and self.running.is_set():
                    self.show_translation(value)
                    self.status.set("Çeviri gösteriliyor · F8 ile durdur")
                elif kind == "clear":
                    self.close_overlay()
                elif kind == "error":
                    self.stop()
                    self.status.set("Hata: " + value[:220])
                    messagebox.showerror("Çeviri durdu", value[:500])
        except queue.Empty:
            pass
        self.after(100, self.process_messages)

    def watch_hotkey(self):
        import ctypes
        pressed = bool(ctypes.windll.user32.GetAsyncKeyState(0x77) & 0x8000)  # VK_F8
        if pressed and not self.previous_hotkey:
            self.toggle()
        self.previous_hotkey = pressed
        self.after(120, self.watch_hotkey)

    def exit_app(self):
        self.stop()
        self.close_overlay()
        self.destroy()


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(self_test())
    elif sys.platform != "win32":
        print("Arayüz Windows için tasarlanmıştır.")
    else:
        App().mainloop()
