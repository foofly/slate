import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport


@pytest_asyncio.fixture
async def client(tmp_path):
    from server import config, main
    from server.search import SearchIndex
    from server.vault import Vault

    original_vault = main.vault
    original_search = main.search_index
    original_readonly = config.readonly

    main.vault = Vault(tmp_path)
    main.search_index = SearchIndex(tmp_path)
    config.readonly = False

    async with AsyncClient(transport=ASGITransport(app=main.app), base_url="http://test") as ac:
        yield ac

    main.vault = original_vault
    main.search_index = original_search
    config.readonly = original_readonly
