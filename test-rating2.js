const http = require('http');

async function testRating() {
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente1@redmaestra.com', password: 'Cliente1234' })
  });
  const loginData = await loginRes.json();

  const rateRes = await fetch('http://localhost:3000/ratings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.access_token 
    },
    body: JSON.stringify({ targetId: 'f931b1b5-8142-4f97-aea2-5a0e4afeead5', score: 1 })
  });
  const rateData = await rateRes.json();
  console.log("Rate response:", rateData);
}

testRating().catch(console.error);
