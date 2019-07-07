import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

const redirectURI = 'http://localhost:3000';
const clientId = process.env.REACT_APP_CLIENT_ID;
const getUserCodeLogin = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile%20email&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${redirectURI}&response_type=code&client_id=${clientId}`;

function getCode() {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('code');
}

function Login() {
  const [code, setCode] = useState(null);

  useEffect(() => {
    const codeQuery = getCode();
    if (codeQuery) {
      setCode(codeQuery);
    }
  }, [setCode]);

  if (code) {
    alert(code);
  }

  function handleLoginClick() {
    window.location.href = getUserCodeLogin;
  }

  return (
    <div>
      <Button onClick={handleLoginClick}>Login</Button>
    </div>
  );
}

export default Login;
