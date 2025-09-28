

export default function Layout({ children }) {
  // add auth protection
  return (
   <div>
     {children}
   </div>
  )
}