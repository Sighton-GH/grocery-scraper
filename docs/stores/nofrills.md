# No Frills Scraper Documentation

## Platform & Architecture
- **Website**: https://www.nofrills.ca
- **E-Commerce Platform**: Loblaw Digital / PC Express
- **API Base**: https://api.pcexpress.ca

## Search Endpoint
`POST https://api.pcexpress.ca/product-facade/v3/products/search`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-apikey`: `C1xujSegT5j3ap3yPlHG6xDpaCzRlqmX` (standard PC Express web API key)
- **Payload**:
  ```json
  {
    "pagination": { "from": 0, "size": 24 },
    "searchTerm": "milk",
    "storeId": "3133"
  }
  ```

## Branch Selection
Branch is configured via the `storeId` parameter in the payload (e.g. `3133` for Dufferin Mall, Toronto; `3942` for Hastings St, Vancouver).

## Bot Mitigation & Block Analysis
- `robots.txt` returns `HTTP 200 OK`.
- The product facade endpoint enforces Akamai bot protection and session tokens. Unauthenticated direct backend requests receive `HTTP 403 Forbidden`.
- Per Rule 3, status is recorded as `blocked` with HTTP 403.
