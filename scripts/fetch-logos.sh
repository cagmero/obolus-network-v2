#!/bin/bash
# Fetch stock ticker logos from logo.dev API
# Saves to public/stocks/<TICKER>.png

DEST="public/stocks"
TOKEN="pk_NXs6RR1yS6ihs4bCMjd4Zg"
BASE="https://img.logo.dev/ticker"

mkdir -p "$DEST"

TICKERS="tsla aapl nvda googl spy crcl mu qqq amzn"

for t in $TICKERS; do
  UPPER=$(echo "$t" | tr '[:lower:]' '[:upper:]')
  echo "Downloading $UPPER..."
  curl -sL -o "${DEST}/${UPPER}.png" "${BASE}/${t}?token=${TOKEN}"
  echo "  -> ${DEST}/${UPPER}.png ($(wc -c < "${DEST}/${UPPER}.png") bytes)"
done

echo "Done!"
