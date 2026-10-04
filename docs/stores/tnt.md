# T&T Supermarket Scraper Documentation

## Platform & Architecture
- **Website**: https://www.tntsupermarket.com
- **Platform**: Magento / Adobe Commerce Cloud with Cloudflare

## Search Endpoint
`GET https://www.tntsupermarket.com/eng/catalogsearch/result/?q={query}`
- **Parameters**:
  - `q`: Search string

## Branch Selection
Branch is handled through session cookies and location selection on storefront.

## Bot Mitigation & Block Analysis
- Both `robots.txt` and search queries return `HTTP 403 Forbidden` for automated HTTP requests via Cloudflare Bot Management.
- Per Rule 3, status is recorded as `blocked`.
