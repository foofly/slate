async def test_health_and_note_lifecycle(client):
    response = await client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}
    response = await client.post('/api/notes/smoke.md', json={'content': '# Maintenance smoke'})
    assert response.status_code == 201
    response = await client.put('/api/notes/smoke.md', json={'content': '# Updated smoke'})
    assert response.status_code == 200
    response = await client.get('/api/notes/smoke.md')
    assert response.json()['content'] == '# Updated smoke'
    response = await client.get('/api/search', params={'q': 'Updated'})
    assert response.status_code == 200
    assert any(hit['path'] == 'smoke.md' for hit in response.json())
