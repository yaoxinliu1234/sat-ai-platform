const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 替换错误处理部分
content = content.replace(
  /} catch \(error\) \{\s*console\.error\('Login error:', error\)\s*setLoginError\('Login failed: ' \+ error\.message\)\s*\}/,
  `} catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed: ' + error.message)
    }`
);

// 添加更详细的错误处理
content = content.replace(
  /if \(loginResponse\.ok\) \{/,
  `if (loginResponse.ok) {
        console.log('Login response status:', loginResponse.status)
        console.log('Login response headers:', loginResponse.headers)`
);

content = content.replace(
  /} else \{\s*const errorData = await registerResponse\.json\(\)\s*console\.error\('Registration failed:', errorData\)\s*setLoginError\('Registration failed\. Please try again\.'\)\s*\}/,
  `} else {
        console.log('Registration response status:', registerResponse.status)
        const errorData = await registerResponse.json()
        console.error('Registration failed:', errorData)
        setLoginError('Registration failed: ' + JSON.stringify(errorData))
      }`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Updated App.tsx with better error handling');
