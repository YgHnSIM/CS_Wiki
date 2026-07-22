from __future__ import annotations

import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from check_external_links import classify_status  # noqa: E402


class ExternalLinkTests(unittest.TestCase):
    def test_status_classification_distinguishes_breakage_from_access_limits(self) -> None:
        self.assertEqual("ok", classify_status(200))
        self.assertEqual("ok", classify_status(308))
        self.assertEqual("restricted", classify_status(403))
        self.assertEqual("restricted", classify_status(429))
        self.assertEqual("broken", classify_status(404))
        self.assertEqual("broken", classify_status(410))
        self.assertEqual("error", classify_status(503))


if __name__ == "__main__":
    unittest.main()
