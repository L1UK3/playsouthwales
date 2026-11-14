from app.routers import public

# — /api/ —


class TestApiIndex:
    def test_returns_html_page(self, client):
        resp = client.get("/api/")
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("text/html")
        assert "<title>Play! South Wales API</title>" in resp.text

    def test_path_without_slash_reaches_page(self, client):
        resp = client.get("/api")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]

    def test_lists_every_public_endpoint(self, client):
        """Fail when a new public route is missing from the guide."""
        body = client.get("/api/").text
        public_paths = {route.path for route in public.router.routes}
        assert public_paths
        for path in public_paths:
            assert path in body, f"{path} is missing from the API guide"

    def test_describes_only_get_endpoints(self, client):
        body = client.get("/api/").text
        assert "POST" not in body
        assert "DELETE" not in body

    def test_example_urls_use_request_host(self, client):
        body = client.get("/api/").text
        assert 'curl "http://testserver/api/health"' in body

    def test_page_is_not_in_openapi_schema(self, client):
        paths = client.get("/openapi.json").json()["paths"]
        assert "/api/" not in paths
