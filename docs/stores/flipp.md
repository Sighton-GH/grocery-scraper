# Flipp Circulars & Flyers Adapter Documentation

## Platform & Architecture
- **API Base**: https://backflipp.wishabi.com/flipp/items/search
- **Source Label**: `flipp` (strictly distinct from website storefronts)

## Search Endpoint
`GET https://backflipp.wishabi.com/flipp/items/search?q={query}&postal_code={postal_code}`
- **Parameters**:
  - `q`: Search query string
  - `postal_code`: Canadian postal code (e.g. `M5V2T6`, `V5K0A1`)

## Mapping & Rules
- Merchant names mapped explicitly to store IDs:
  - `Walmart` / `Walmart Canada` -> `walmart`
  - `No Frills` -> `nofrills`
  - `Loblaws` -> `loblaws`
  - `Real Canadian Superstore` -> `superstore`
  - `Save-On-Foods` -> `saveon`
  - `T&T Supermarket` -> `tnt`
  - `Metro` -> `metro`
  - `Food Basics` -> `foodbasics`
  - `Sobeys` -> `sobeys`
  - `FreshCo` -> `freshco`
  - `Costco` / `Costco Wholesale` -> `costco`
- Rows with unmapped merchants are dropped.
- Rows with `current_price == null` are dropped.
- Preserves raw flyer values: `original_price`, `sale_story`, `pre_price_text`, `post_price_text`.
- Raw responses saved to `data/raw/flipp/<date>/query_<q>_<postal>.json`.
