import React from 'react'
import { CCol, CRow, CForm, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { Condition, RFFCFormSelect, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import countryList from 'src/data/countryList.json'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CCallout color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CCallout>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const AlertWizard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddAlert', values: values })
  }

  const formValues = {}

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Tenant Alerting Wizard"
    >
      <CippWizard.Page title="Tenant Choice" description="Choose the tenants to send alerts for">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-Choco-App-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=true"
              columns={[
                {
                  name: 'Display Name',
                  selector: (row) => row['displayName'],
                  sortable: true,
                  exportselector: 'displayName',
                },
                {
                  name: 'Default Domain Name',
                  selector: (row) => row['defaultDomainName'],
                  sortable: true,
                  exportselector: 'mail',
                },
              ]}
              fieldProps={props}
            />
          )}
        </Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Select Alerts" description="Select which alerts you want to receive.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Select Legacy Alerts to receive</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <p>
            Alerts setup on this page are considered legacy. These alerts run every 15 minutes and
            do not use our advanced alerting engine.
          </p>
          <RFFCFormSwitch
            value={true}
            name="SetAlerts"
            label="Setup alerts for the selected tenants"
          />
          <CRow>
            <Condition when="SetAlerts" is={true}>
              <hr />
              <CCol>
                <RFFCFormSwitch
                  value={true}
                  name="MFAAlertUsers"
                  label="Alert on users without any form of MFA"
                />
                <RFFCFormSwitch name="MFAAdmins" label="Alert on admins without any form of MFA" />
                <RFFCFormSwitch
                  name="NoCAConfig"
                  label="Alert on tenants without a Conditional Access policy, while having Conditional Access licensing available."
                />
                <RFFCFormSwitch name="AdminPassword" label="Alert on changed admin Passwords" />
                <RFFCFormSwitch name="QuotaUsed" label="Alert on 90% mailbox quota used" />
                <RFFCFormSwitch name="SharePointQuota" label="Alert on 90% SharePoint quota used" />

                <RFFCFormSwitch
                  name="ExpiringLicenses"
                  label="Alert on licenses expiring in 30 days"
                />
                <RFFCFormSwitch
                  name="SecDefaultsUpsell"
                  label="Alert on Security Defaults automatic enablement"
                />
              </CCol>
              <CCol>
                <RFFCFormSwitch
                  name="DefenderStatus"
                  label="Alert if Defender is not running (Tenant must be on-boarded in Lighthouse)"
                />
                <RFFCFormSwitch
                  name="DefenderMalware"
                  label="Alert on Defender Malware found  (Tenant must be on-boarded in Lighthouse)"
                />
                <RFFCFormSwitch name="UnusedLicenses" label="Alert on unused licenses" />
                <RFFCFormSwitch name="OverusedLicenses" label="Alert on overused licenses" />
                <RFFCFormSwitch
                  name="AppSecretExpiry"
                  label="Alert on expiring application secrets"
                />
                <RFFCFormSwitch name="ApnCertExpiry" label="Alert on expiring APN certificates" />
                <RFFCFormSwitch name="VppTokenExpiry" label="Alert on expiring VPP tokens" />
                <RFFCFormSwitch name="DepTokenExpiry" label="Alert on expiring DEP tokens" />
              </CCol>
            </Condition>
          </CRow>
        </CForm>

        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Select Webhook Alerts"
        description="Select which alerts you want to receive."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Select webhook alerts</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <p>
            This setting will subscribe CIPP to receive the audit logs from this tenant directly.
            You can then use the Alert Rules page to create alerts or take actions based on these
            logs.
          </p>
          <CRow>
            <CCol>
              <RFFCFormSwitch
                name="AuditLogEnable"
                label="Subscribe this tenant to receive audit logs within CIPP"
              />
            </CCol>
          </CRow>
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {!postResults.isSuccess && (
          <FormSpy>
            {/* eslint-disable react/prop-types */}
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on users without any form of MFA
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.MFAAlertUsers ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on admins without any form of MFA
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.MFAAdmins ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on new users added to any admin role
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.NewRole ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on changed admin Passwords
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.AdminPassword ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert if Defender is not running
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.DefenderStatus ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on Defender Malware
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.DefenderMalware ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on 90% mailbox quota used
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.QuotaUsed ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on unused licenses
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.UnusedLicenses ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on overused licenses
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.OverusedLicenses ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring application secrets
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.AppSecretExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring APN certificates
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.ApnCertExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring VPP tokens
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.VppTokenExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on expiring DEP tokens
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.DepTokenExpiry ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on no CA policies
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.NoCAConfig ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Alert on Security Defaults automatic enablement
                          <FontAwesomeIcon
                            color="#0099cc"
                            size="lg"
                            icon={props.values.SecDefaultsUpsell ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                      </CListGroup>
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        )}
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && (
          <CCallout color="success">
            {postResults.data.Results.map((message, idx) => {
              return <li key={idx}>{message}</li>
            })}
          </CCallout>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AlertWizard
