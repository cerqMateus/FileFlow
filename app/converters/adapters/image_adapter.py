from PIL import Image


class PillowImageAdapter:
    def jpg_to_png(self, jpg_path: str, png_path: str) -> bool:
        try:
            with Image.open(jpg_path) as img:
                if img.mode == "RGBA":
                    img.save(png_path, "PNG")
                else:
                    img.convert("RGB").save(png_path, "PNG")
            return True
        except Exception as ex:
            print(f"Erro na conversão: {ex}")
            return False

    def png_to_jpg(self, png_path: str, jpg_path: str) -> bool:
        try:
            with Image.open(png_path) as img:
                if img.mode in ("RGBA", "LA", "P"):
                    rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "P":
                        img = img.convert("RGBA")
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
                    rgb_img.save(jpg_path, "JPEG", quality=95)
                else:
                    img.convert("RGB").save(jpg_path, "JPEG", quality=95)
            return True
        except Exception as ex:
            print(f"Erro na conversão: {ex}")
            return False
