import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.references.append(value)


def local_path(reference, base):
    if reference.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "data:")):
        return None

    path = reference.split("?", 1)[0].split("#", 1)[0]
    if not path:
        return None
    return ROOT / path.lstrip("/") if path.startswith("/") else base / path


class SiteTests(unittest.TestCase):
    def test_html_pages_and_local_references_exist(self):
        pages = sorted(ROOT.glob("*.html"))
        self.assertTrue(pages, "Expected the Spritee HTML pages to be present.")

        stylesheets = []
        for page in pages:
            parser = LocalReferenceParser()
            parser.feed(page.read_text(encoding="utf-8"))
            for reference in parser.references:
                resolved = local_path(reference, page.parent)
                if resolved is not None:
                    self.assertTrue(resolved.is_file(), f"{page.name} references missing file {reference}")
                    if resolved.suffix.lower() == ".css":
                        stylesheets.append(resolved)

        for stylesheet in stylesheets:
            css = stylesheet.read_text(encoding="utf-8")
            css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
            for reference in re.findall(r"url\((.*?)\)", css):
                reference = reference.strip().strip("\"'")
                resolved = local_path(reference, stylesheet.parent)
                if resolved is not None:
                    self.assertTrue(resolved.is_file(), f"{stylesheet.name} references missing file {reference}")

    def test_homepage_exposes_container_build_identifier(self):
        homepage = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="build-commit"', homepage)
        self.assertIn("__BUILD_COMMIT__", homepage)


if __name__ == "__main__":
    unittest.main()
