(async () => {
  const email = `testuser+${Date.now()}@example.com`
  const signup = await fetch('http://localhost:4000/api/signup', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', phone: '555-0000', email, password: 'pass1234', dob: '1990-01-01', gender: 'male', city: 'Testville', pincode: '00000', state: 'TS' })
  })
  console.log('SIGNUP', signup.status)
  console.log(await signup.text())
  const login = await fetch('http://localhost:4000/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'pass1234' })
  })
  console.log('LOGIN', login.status)
  console.log(await login.text())
})()
