import SnakeCard from './SnakeCard'

/**
 * Example usage of SnakeCard component
 * 
 * This demonstrates how to use the SnakeCard component with different content.
 * The snake border animation will appear on hover with a glowing sky-400 neon effect.
 */
function SnakeCardExample() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">SnakeCard Examples</h1>
        
        {/* Example 1: Basic Card */}
        <SnakeCard className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Card</h2>
          <p className="text-gray-600">
            Hover over this card to see the snake border animation! The glowing sky-400 neon line will travel around all four edges.
          </p>
        </SnakeCard>

        {/* Example 2: Image Card */}
        <SnakeCard className="rounded-xl overflow-hidden bg-white shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60" 
            alt="Mountain"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Card</h2>
            <p className="text-gray-600">
              This card has an image and still shows the snake border animation on hover.
            </p>
          </div>
        </SnakeCard>

        {/* Example 3: Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SnakeCard className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Card 1</h3>
            <p className="text-gray-600 text-sm">
              Each card in the grid has its own snake border animation.
            </p>
          </SnakeCard>

          <SnakeCard className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Card 2</h3>
            <p className="text-gray-600 text-sm">
              The animation works independently on each card.
            </p>
          </SnakeCard>
        </div>

        {/* Example 4: Custom Styled Card */}
        <SnakeCard className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Premium Card</h2>
          <p className="text-white/90 mb-4">
            This card has a custom gradient background. The snake border still works perfectly!
          </p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Click Me
          </button>
        </SnakeCard>
      </div>
    </div>
  )
}

export default SnakeCardExample
