(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'pass' })
    })
    console.log('STATUS', res.status)
    const text = await res.text()
    try { console.log('BODY', JSON.parse(text)) } catch { console.log('BODY', text) }
  } catch (e) {
    console.error('ERROR', e)
  }
})()
