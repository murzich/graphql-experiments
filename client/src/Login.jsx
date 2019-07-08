import { gql } from 'apollo-boost';
import React, { useEffect, useRef } from 'react';
import { Button } from 'semantic-ui-react';
import { Mutation } from 'react-apollo';

const redirectURI = 'http://localhost:3000';
const clientId = process.env.REACT_APP_CLIENT_ID;
const getUserCodeLogin = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile%20email&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${redirectURI}&response_type=code&client_id=${clientId}`;


function getCode() {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('code');
}

const OAUTH_GOOGLE_MUTATION = gql`
  mutation oAuthGoogle($code: String!) {
    oAuthGoogle(code: $code) {
      token
      email
    }
  }
`;

function Login() {
  const oAuthMutationRef = useRef(null);

  useEffect(() => {
    const code = getCode();
    if (code) {
      oAuthMutationRef.current({ variables: { code } });
      window.history.replaceState({}, '', '/');
    }
  }, []);

  function handleLoginClick() {
    window.location.href = getUserCodeLogin;
  }

  return (
    <Mutation mutation={OAUTH_GOOGLE_MUTATION}>
      {mutation => {
        oAuthMutationRef.current = mutation;
        return <Button onClick={handleLoginClick}>Login</Button>;
      }}
    </Mutation>
  );
}

export default Login;
