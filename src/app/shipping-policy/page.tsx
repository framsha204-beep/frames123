export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-8">Shipping Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/50">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Delivery Areas</h2>
            <p>We deliver to all major cities and towns across Pakistan. For remote areas, delivery may take additional time.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Delivery Time</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Major cities (Lahore, Karachi, Islamabad, Rawalpindi): 3-5 business days</li>
              <li>Other cities: 5-7 business days</li>
              <li>Remote areas: 7-10 business days</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Shipping Charges</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Orders above Rs. 5,000: <span className="text-green-400">Free shipping</span></li>
              <li>Orders below Rs. 5,000: Flat rate of Rs. 250</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Packaging</h2>
            <p>All frames are carefully packaged with bubble wrap, corner protectors, and sturdy boxes to ensure safe delivery. Fragile items receive extra protection.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Order Tracking</h2>
            <p>Once your order is dispatched, you will receive a WhatsApp message with tracking details. You can also track your order on our website using your order number.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Damaged Items</h2>
            <p>If you receive a damaged item, please contact us within 24 hours with photos. We will arrange a free replacement or full refund.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
