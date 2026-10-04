# Save-On-Foods Scraper Documentation

## Platform & Architecture
- **Website**: https://www.saveonfoods.com
- **Storefront API**: https://shop.saveonfoods.com/api/v1/
- **Parent Company**: Pattison Food Group

## Search Endpoint
`GET https://shop.saveonfoods.com/api/v1/stores/{storeId}/directory/search?q={query}`
- **Parameters**:
  - `q`: Search string (e.g. `milk`)
  - `storeId`: Branch retail store number (e.g. `1982` for Cambie St, Vancouver)

## Branch Selection
Branch is selected by setting the `storeId` path variable. Different store IDs reflect regional warehouse inventories in BC and Alberta.

## Bot Mitigation & Block Analysis
- `robots.txt` returns `HTTP 403 Forbidden` for standard automated requests.
- The direct storefront API employs Cloudflare / Akamai bot protection returning `HTTP 403 Forbidden` when requested without an interactive browser session.
- Per Rule 3, status is recorded as `blocked` with HTTP 403 and response excerpt.
