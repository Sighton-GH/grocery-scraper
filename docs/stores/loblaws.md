# Loblaws Scraper Documentation

## Platform & Architecture
- **Website**: https://www.loblaws.ca
- **E-Commerce Platform**: Loblaw Digital / PC Express (shared platform with No Frills and Real Canadian Superstore)
- **API Base**: https://api.pcexpress.ca

## Search Endpoint
`POST https://api.pcexpress.ca/product-facade/v3/products/search`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-apikey`: `C1xujSegT5j3ap3yPlHG6xDpaCzRlqmX`
- **Payload**:
  ```json
  {
    "pagination": { "from": 0, "size": 24 },
    "searchTerm": "milk",
    "storeId": "1006"
  }
  ```

## Branch Selection
Branch is passed as `storeId` in JSON payload (e.g. `1006` for Queen & Portland, Toronto; `1524` for Arbutus, Vancouver).

## Bot Mitigation & Block Analysis
- `robots.txt` returns `HTTP 200 OK`.
- Both storefront search HTML and the PC Express API enforce Akamai EdgeSuite bot defenses. Requests from non-interactive clients without Akamai session verification receive `HTTP 403 Forbidden`.
- Per Rule 3, status is recorded as `blocked`.
