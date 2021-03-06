/* global FS mixpanel $crisp */
import { Form } from '@ant-design/compatible';

import '@ant-design/compatible/assets/index.css';
import { Input, Button, Checkbox } from 'antd';
import { router } from 'umi';
import PropTypes from 'prop-types';
import { lowerCaseQueryParams } from '@/services/helpers';
import arrow from '../../assets/img/arrow.svg';
import styles from './index.less';
import { useEffect } from 'react';

const FormItem = Form.Item;

const appleoneProtection = 'https://jurbly.s3.amazonaws.com/Agreement.pdf';
const appleOneCompayId = '5e95d7d3aed1120001480d69';
const SignIn = Form.create()(props => {
  const { form, location, skip, executeStartedEvent, companyId } = props;

  const { id, chat, simple, question: questionIndex } = lowerCaseQueryParams(location.search);

  const skipForm = e => {
    e.preventDefault();

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      mixpanel.track('Interview started');
      executeStartedEvent();
      router.push(`record${location.search}`);
    });
  };

  const AppleOneCheckBox = (
    <Checkbox>
      {' '}
      I agree to{' '}
      <a rel="noopener noreferrer" target="_blank" href={appleoneProtection}>
        AppleOne's Agreement
      </a>{' '}
      & the{' '}
      <a rel="noopener noreferrer" target="_blank" href="https://blog.jurbly.com/privacy">
        Terms & Conditions
      </a>
    </Checkbox>
  );

  const checkboxField = companyId => {
    if (appleOneCompayId === companyId) {
      return (
        <FormItem>
          {form.getFieldDecorator('terms', {
            valuePropName: 'checked',
            initialValue: false,
            rules: [
              {
                transform: value => String(value),
                type: 'enum',
                enum: ['true'],
                message: 'Please review the Terms & Conditions.',
              },
            ],
          })(AppleOneCheckBox)}
        </FormItem>
      );
    } else {
    }
  };

  const nameEmailForm = () => (
    <>
      <div className={styles.container}>
        <Form hideRequiredMark onSubmit={okHandle}>
          <FormItem>
            {form.getFieldDecorator('fullName', {
              rules: [
                {
                  required: true,
                  message: 'Please input your full name!',
                },
              ],
            })(<Input placeholder="Name" />)}
          </FormItem>
          <FormItem>
            {form.getFieldDecorator('email', {
              rules: [
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ],
            })(<Input placeholder="E-mail" />)}
          </FormItem>
          <Form.Item>
            {checkboxField(companyId)}
            <div className={styles.Login_right_area_buttom_wrapper}>
              <Button type="primary" htmlType="submit" className={styles.button_start}>
                Start now
                <img src={arrow} />
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </>
  );

  const skipFormButton = () => (
    <Form>
      <h1 style={{ fontSize: 20, marginBottom: 40 }}>Click the button below to get started!</h1>
      {checkboxField(companyId)}
      <Button size="large" style={{ marginBottom: 40 }} type="primary" onClick={skipForm}>
        Take Interview Now
      </Button>
    </Form>
  );

  const okHandle = e => {
    e.preventDefault();

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const { fullName, email } = fieldsValue;

      mixpanel.alias(email);
      mixpanel.people.set({
        $email: email,
        $last_login: new Date(),
        $name: fullName,
        id,
        interviewStage: 'started',
      });
      mixpanel.track('Intervicytew started');
      FS.identify(email, {
        displayName: fullName,
        email,
      });
      $crisp.push(['set', 'user:email', email]);
      $crisp.push(['set', 'user:nickname', [fullName]]);

      // router.push(`record${location.search}`);
      executeStartedEvent(email, fullName);

      router.push(
        `record?id=${id}&fullName=${fullName}&email=${email}${
          simple === '1' ? '&simple=' + simple : ''
        }${chat === '0' ? '&chat=' + chat : ''}${questionIndex ? '&question=' + questionIndex : ''}`
      );

      form.resetFields();
    });
  };

  return skip ? skipFormButton() : nameEmailForm();
});

SignIn.propTypes = {
  location: PropTypes.object.isRequired,
  skip: PropTypes.bool.isRequired,
  companyId: PropTypes.string,
};
export default SignIn;
