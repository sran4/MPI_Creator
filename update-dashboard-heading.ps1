# Read the current file
$content = Get-Content 'app/dashboard/page.tsx' -Raw

# Add user interface and state
$userInterface = @'
interface User {
  _id: string
  email: string
  fullName: string
  userType: 'admin' | 'engineer'
  title?: string
}

'@

$content = $content -replace 'interface MPI \{', "$userInterface
interface MPI {"

# Add user state
$userState = @'
  const [user, setUser] = useState<User | null>(null)
'@

$content = $content -replace '  const \[mpis, setMpis\] = useState<MPI\[\]>\(\[\]\)', "  const [mpis, setMpis] = useState<MPI[]>([])
$userState"

# Add fetchUser function
$fetchUserFunction = @'
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': Bearer $token
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }
'@

$content = $content -replace '  useEffect\(\(\) => \{', "  useEffect(() => {
    fetchUser()"

# Update the heading
$content = $content -replace '            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>', '            <h1 className="text-3xl font-bold text-white mb-2">{user?.userType === "admin" ? "Admin Dashboard" : "Engineer Dashboard"}</h1>'

# Write the updated content back
Set-Content 'app/dashboard/page.tsx' -Value $content -NoNewline

Write-Host "Dashboard heading updated successfully!"
