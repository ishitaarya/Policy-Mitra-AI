export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-700/60" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-transparent px-3 text-slate-500">or</span>
      </div>
    </div>
  )
}
