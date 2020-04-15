import React from 'react';

import { useFormik, FormikProvider } from 'formik';
import * as yup from 'yup';
import { Flex } from 'rebass';
import { useSnackbar } from 'notistack';

import { TextField } from '../form';
import { Card, Content, Button, CardActions } from '../ui';
import { useMutation } from '../../relay';

import { useHistory } from '../../routing/useHistory';

import Link from '../../routing/Link';

import { UserRegisterWithEmail } from './UserRegisterWithEmailMutation';
import { UserRegisterWithEmailMutation } from './__generated__/UserRegisterWithEmailMutation.graphql';
import { updateToken } from './security';

type Values = {
  name: string;
  email: string;
  password: string;
};
const SignUp = () => {
  const [userRegisterWithEmail, isPending] = useMutation<UserRegisterWithEmailMutation>(UserRegisterWithEmail);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const history = useHistory();

  const onSubmit = (values: Values) => {
    closeSnackbar();

    const config = {
      variables: {
        input: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      },
      onCompleted: ({ UserRegisterWithEmail }) => {
        if (UserRegisterWithEmail.error) {
          enqueueSnackbar(UserRegisterWithEmail.error);
          return;
        }

        enqueueSnackbar(UserRegisterWithEmail.success);
        updateToken(UserRegisterWithEmail.token);

        history.push('/');
      },
    };

    userRegisterWithEmail(config);
  };

  const formik = useFormik<Values>({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validateOnMount: true,
    validationSchema: yup.object().shape({
      name: yup.string().required('Name is required'),
      email: yup
        .string()
        .email()
        .required('Email is required'),
      password: yup.string().required('Password is required'),
    }),
    onSubmit,
  });

  const { handleSubmit, isValid } = formik;

  const isSubmitDisabled = !isValid || isPending;

  return (
    <FormikProvider value={formik}>
      <Content>
        <Card mb='10px' p='10px' justifyContent='center' flex={1}>
          <Flex flexDirection='column'>
            <span>SignUp</span>
            <TextField name='name' label='name' />
            <TextField name='email' label='email' />
            <TextField name='password' label='password' type='password' />
            <CardActions justifyContent='flex-end'>
              <Button
                variant='contained'
                color='primary'
                mt='10px'
                type='submit'
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Sign Up
              </Button>
            </CardActions>
            <Link to={'/auth/login'}>Already have an account? Login</Link>
          </Flex>
        </Card>
      </Content>
    </FormikProvider>
  );
};

export default SignUp;
