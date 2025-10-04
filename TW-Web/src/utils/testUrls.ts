// Test URLs for different stores - for development/testing purposes
export const testUrls = {
  amazon: [
    'https://www.amazon.com/Sony-WH-1000XM4-Canceling-Headphones-phone-call/dp/B0863TXGM3',
    'https://www.amazon.com/Echo-Dot-3rd-Gen-Alexa-Smart-Speaker/dp/B07FZ8S74R',
    'https://amazon.com/Apple-MacBook-Air-13-inch-laptop/dp/B08N5WRWNW',
    'https://www.amazon.com/Instant-Pot-Duo-7-in-1-Electric-Pressure-Cooker/dp/B00FLYWNYQ'
  ],
  target: [
    'https://www.target.com/p/keurig-k-mini-single-serve-k-cup-pod-coffee-maker/-/A-53734379',
    'https://target.com/p/ninja-foodi-personal-blender-with-18-oz-cup-and-spout-lid/-/A-76151822',
    'https://www.target.com/p/cuisinart-elemental-13-cup-food-processor-gunmetal/-/A-14942156'
  ],
  bestbuy: [
    'https://www.bestbuy.com/site/samsung-65-class-7-series-4k-uhd-smart-tizen-tv/6418599.p',
    'https://bestbuy.com/site/apple-iphone-15-pro-128gb-natural-titanium-verizon/6525411.p',
    'https://www.bestbuy.com/site/sony-wh-1000xm5-wireless-noise-canceling-headphones/6505727.p'
  ],
  etsy: [
    'https://www.etsy.com/listing/123456789/handmade-ceramic-coffee-mug-set-stoneware',
    'https://etsy.com/listing/987654321/vintage-wooden-cutting-board-walnut-maple',
    'https://www.etsy.com/listing/456789123/personalized-leather-wallet-men-gifts'
  ],
  walmart: [
    'https://www.walmart.com/ip/Great-Value-Pure-Vanilla-Extract-1-fl-oz/10315893',
    'https://walmart.com/ip/Instant-Pot-Duo-7-in-1-Electric-Pressure-Cooker-6-Quart/52734174',
    'https://www.walmart.com/ip/Apple-AirPods-Pro-2nd-Generation-Lightning/1752657271'
  ]
}

// Helper function to get a random test URL
export function getRandomTestUrl(): string {
  const stores = Object.keys(testUrls)
  const randomStore = stores[Math.floor(Math.random() * stores.length)] as keyof typeof testUrls
  const urls = testUrls[randomStore]
  return urls[Math.floor(Math.random() * urls.length)]
}

// Helper function to get test URLs for a specific store
export function getTestUrlsForStore(store: keyof typeof testUrls): string[] {
  return testUrls[store] || []
}