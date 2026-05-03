import os
import tempfile

# Set a writable vault path before server.main is imported (it creates a Vault at module level)
os.environ.setdefault("SLATE_VAULT_PATH", tempfile.mkdtemp())
