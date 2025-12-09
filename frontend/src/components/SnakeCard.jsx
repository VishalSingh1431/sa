/**
 * SnakeCard - A reusable component with snake border animation on hover
 * 
 * @param {React.ReactNode} children - Content to wrap with snake border
 * @param {string} className - Additional CSS classes
 * 
 * Features:
 * - Glowing sky-400 neon line travels around border on hover
 * - Animation stops when hover ends
 * - Smooth, continuous animation around all 4 edges
 */
function SnakeCard({ children, className = '' }) {
  return (
    <div className={`snake-border-card relative ${className}`}>
      <div className="snake-border-bottom"></div>
      <div className="snake-border-left"></div>
      {children}
    </div>
  )
}

export default SnakeCard
