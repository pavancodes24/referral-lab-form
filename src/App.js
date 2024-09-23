import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Audio } from 'react-loader-spinner';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';

import CloudinaryUpload from './CloudinaryUpload';

function App() {
  const notifySuccess = () =>
    toast.success('sucessfully added!', {
      position: 'top-right',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });

  const notifyDelete = () =>
    toast.error('Deleted Successfully!', {
      position: 'top-right',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });

  const notifySuccessUpdate = () =>
    toast.success('sucessfully Updated!', {
      position: 'top-right',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  const [dataList, setDataList] = useState([]);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [imgLoader, setImgLoader] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Self',
    name: '',
    phone: '',
    empId: '',
    email: '',
    pincode: '',
    gender: '',
    dob: '',
    city: '',
    state: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [loader, setLoader] = useState(false);

  const [noPhone, setNoPhone] = useState(0);
  const [noEmpId, setNoEmpId] = useState('');
  const [noName, setNoName] = useState('');

  const [utrData, setUtrData] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || '';
    const empid = params.get('empid') || '';
    const phonenumber = params.get('phonenumber') || '';
    setNoPhone(phonenumber);
    setNoEmpId(empid);
    setNoName(name);
    if (formData.type === 'Self') {
      setFormData((prevData) => ({
        ...prevData,
        name,
        phone: phonenumber,
        empId: empid,
      }));
    }
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      if (value === 'Others') {
        setFormData({
          type: 'Others',
          name: '',
          phone: '',
          empId: '',
          email: '',
          pincode: '',
          gender: '',
          dob: '',
          city: '',
          state: '',
        });
      } else {
        setFormData({
          type: 'Self',
          name: '',
          phone: '',
          empId: '',
          email: '',
          pincode: '',
          gender: '',
          dob: '',
          city: '',
          state: '',
        });
      }
    } else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.type === 'Self' && !formData.empId) {
      alert('Emp ID is required for Self.');
      return;
    }

    if (isEditing) {
      const updatedList = dataList.map((item, index) =>
        index === currentIndex ? formData : item
      );
      setDataList(updatedList);
      setIsEditing(false);
      notifySuccessUpdate();
    } else {
      const selfCount = dataList.filter((item) => item.type === 'Self').length;
      if (selfCount > 0 && formData.type === 'Self') {
        alert('Only one "Self" entry is allowed.');
        return;
      }
      setDataList([...dataList, formData]);
      notifySuccess();
    }

    setFormData({
      type: dataList.filter((item) => item.type === 'Self') ? 'Others' : 'Self',
      name: '',
      phone: '',
      empId: '',
      email: '',
      pincode: '',
      gender: '',
      dob: '',
      city: '',
      state: '',
    });
  };

  const handleEdit = (index) => {
    setFormData(dataList[index]);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = dataList.filter((_, i) => i !== index);
    setDataList(updatedList);
    setIsEditing(false);
    notifyDelete();
  };

  const handlePaymentClick = async () => {
    setLoader(true);
    const { data: insertData, error } = await supabase
      .from('users')
      .insert([
        {
          name: noName,
          empid: noEmpId,
          phonenumber: noPhone,
          beneficiary: dataList,
        },
      ])
      .single();

    if (error) {
      console.error('Error inserting user:', error.message);
    } else {
      console.log('User inserted successfully:', insertData, error);
    }

    setLoader(false);

    setShowPaymentPopup(true);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
  };

  const handleSubmitPayment = async () => {
    // Step 1: Find the most recent entry with the given phone number
    const { data: recentUserData, error: fetchError } = await supabase
      .from('users')
      .select('id') // Fetch only the 'id' field to identify the latest entry
      .eq('phonenumber', noPhone ?? 0) // Match the specific phone number
      .order('id', { ascending: false }) // Order by 'id' in descending order (latest entry first)
      .limit(1); // Limit the result to the latest entry

    if (fetchError) {
      console.error('Error fetching recent user:', fetchError.message);
      return; // Exit if there's an error
    }

    if (recentUserData.length === 0) {
      console.error('No user found with the given phone number');
      return; // Exit if no user is found
    }

    const latestUserId = recentUserData[0].id; // Get the 'id' of the latest entry

    // Step 2: Perform the update using the id of the latest record
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ payment_done: true, utr: uploadedUrl }) // Update the fields
      .eq('id', latestUserId); // Use the 'id' to ensure only the latest record is updated

    if (updateError) {
      console.error('Error updating user:', updateError.message);
      alert('something went wrong');
    } else {
      console.log('User updated successfully:', updateData);
      alert('Payment Success(Approval takes 24-48 hrs)');
      window.location.reload();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText('REFERALAB.09@cmsidfc')
      .then(() => {
        alert('UPI ID copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  const isReadOnly = formData.type === 'Self';

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
  };
  return loader ? (
    <>
      <div style={styles.container}>
        <Audio
          height="80"
          width="80"
          radius="9"
          color="green"
          ariaLabel="loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    </>
  ) : (
    <div className="form-container">
      <h1 className="form-title"> Form</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Type:</label>

          {dataList.filter((item) => item.type === 'Self').length > 0 &&
          Object.values(dataList.filter((item) => item.type === 'Self')[0])
            .length == 10 &&
          !isEditing ? (
            <select
              disabled
              name="type"
              value={'Others'}
              // onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Type</option>
              <option value="Self">Self</option>
              <option value="Others">Others</option>
            </select>
          ) : isEditing ? (
            <select
              disabled
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Type</option>
              <option value="Self">Self</option>
              <option value="Others">Others</option>
            </select>
          ) : (
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Type</option>
              <option value="Self">Self</option>
              <option value="Others">Others</option>
            </select>
          )}
        </div>
        {formData.type == 'Others' && (
          <div style={{ color: 'red', fontSize: '12px' }}>
            <span>Enter Card Holder details </span>
          </div>
        )}

        <br />

        <div className="form-group">
          <label className="form-label">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            readOnly={isReadOnly}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            pattern="[0-9]{10}"
            onInvalid={(e) =>
              e.target.setCustomValidity('Please Enter a Valid  Mobile Number')
            }
            maxLength="10"
            inputMode="numeric"
            placeholder="Enter 10-digit mobile number"
            readOnly={isReadOnly}
            required
          />
        </div>

        {formData.type === 'Self' && (
          <div className="form-group">
            <label className="form-label">Emp ID:</label>
            <input
              type="text"
              name="empId"
              value={formData.empId}
              onChange={handleChange}
              className="form-input"
              readOnly={isReadOnly}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pincode:</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onInvalid={(e) =>
              e.target.setCustomValidity('Please Enter a Valid  Pincode')
            }
            pattern="[0-9]{6}"
            maxLength="6"
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">DOB:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">State:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <button type="submit" className="form-submit-button">
          {isEditing ? 'Update' : 'Submit'}
        </button>
        <br />
        <button
          style={{ backgroundColor: dataList.length == 0 ? 'gray' : 'green' }}
          type="button"
          className="payment-button"
          onClick={handlePaymentClick}
          disabled={dataList.length == 0}
        >
          Proceed to Payment
        </button>
      </form>

      <br />
      <br />
      <br />
      <br />

      {dataList.length > 0 && (
        <div className="card-list">
          {dataList.map((item, index) => (
            <div className="card" key={index}>
              <div className="card-header">
                <h3>{item.type}</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Name:</strong> {item.name}
                </p>
                <p>
                  <strong>Phone:</strong> {item.phone}
                </p>
                <p>
                  <strong>Emp ID:</strong> {item.empId || '-'}
                </p>

                <p>
                  <strong>Email:</strong> {item.email}
                </p>
                <p>
                  <strong>Gender:</strong> {item.gender}
                </p>
                <p>
                  <strong>DOB:</strong> {item.dob}
                </p>
                <p>
                  <strong>City:</strong> {item.city}
                </p>
                <p>
                  <strong>State:</strong> {item.state}
                </p>
              </div>
              <div className="card-footer">
                <button
                  onClick={() => handleEdit(index)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPaymentPopup && (
        <div className="payment-popup">
          {imgLoader ? (
            <>
              <div style={styles.container}>
                <Audio
                  height="80"
                  width="80"
                  radius="9"
                  color="green"
                  ariaLabel="loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            </>
          ) : (
            <div className="payment-popup-content">
              <h3>Payment Details</h3>
              <h4>(Make Payment & upload screenshot)</h4>
              <p>
                <strong>Amount to be paid:</strong> ₹&nbsp;
                {(dataList.length ?? 0) * 3000}
              </p>
              <p>
                <strong>Merchant Name : </strong>
                {'REFERRAL LABS OPC PRIVATE...'}
              </p>
              <p>
                <strong>UPI ID:</strong> {'REFERALAB.09@cmsidfc'}
                <button className="copy-button" onClick={copyToClipboard}>
                  Copy
                </button>
              </p>
              {/* <p>
              <strong>
                UTR :{' '}
                <input
                  onChange={(e) => setUtrData(e.target.value)}
                  maxLength={12}
                />
              </strong>{' '}
            </p> */}
              <p>
                <CloudinaryUpload
                  setUploadedUrl={setUploadedUrl}
                  setImgLoader={setImgLoader}
                />
              </p>
              {/* <button className="close-popup">Cancel</button> */}
              &nbsp;
              <button
                style={{
                  backgroundColor: uploadedUrl !== '' ? 'green' : 'grey',
                }}
                className="close-popup"
                onClick={handleSubmitPayment}
                disabled={uploadedUrl == '' || uploadedUrl == null}
              >
                Submit
              </button>
              &nbsp;
              <span style={{ color: 'red' }} onClick={handleClosePopup}>
                Cancel
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
