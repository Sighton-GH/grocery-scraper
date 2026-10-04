# Walmart Canada Scraper Documentation

## Platform & Architecture
- **Website**: https://www.walmart.ca
- **API Base**: https://www.walmart.ca/api/bsp/browse

## Search Endpoint
`GET https://www.walmart.ca/api/bsp/browse?query={query}&page=1&stores={branchId}`
- **Parameters**:
  - `query`: Search string (e.g. `milk`)
  - `page`: Page index (1-based)
  - `stores`: Walmart store number (e.g. `3058` for Scarborough, Toronto; `1128` for Vancouver)

## Branch Selection
Branch is passed via the `stores` query parameter.

## Bot Mitigation & Block Analysis
- `robots.txt` returns `HTTP 200 OK`.
- The `api/bsp/browse` endpoint blocks headless HTTP clients with `HTTP 403 Forbidden` unless verified via PerimeterX / HUMAN Security challenge cookies.
- Per Rule 3, status is recorded as `blocked`.
