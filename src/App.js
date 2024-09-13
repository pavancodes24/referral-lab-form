import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    phone: '',
    empId: '',
    gender: '',
    dob: '',
    city: '',
    state: '',
  });

  const [dataList, setDataList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || '';
    const empid = params.get('empid') || '';
    const phonenumber = params.get('phonenumber') || '';

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
    setFormData({ ...formData, [name]: value });
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
    } else {
      const selfCount = dataList.filter((item) => item.type === 'Self').length;
      if (selfCount > 0 && formData.type === 'Self') {
        alert('Only one "Self" entry is allowed.');
        return;
      }
      setDataList([...dataList, formData]);
    }

    setFormData({
      type: '',
      name: '',
      phone: '',
      empId: '',
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
  };

  const handlePaymentClick = () => {
    setShowPaymentPopup(true);
  };

  const handleClosePopup = () => {
    setShowPaymentPopup(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText('2334242423243@ybl')
      .then(() => {
        alert('UPI ID copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  const isReadOnly = formData.type === 'Self';

  return (
    <div className="form-container">
      <h1 className="form-title">Insurance Form</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Type:</label>
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
        </div>

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
          <div className="payment-popup-content">
            <h3>Payment Details</h3>
            <p>
              <strong>Amount to be paid:</strong> ₹&nbsp;
              {(dataList.length ?? 0) * 1000}
            </p>
            <p>
              <strong>UPI ID:</strong> {'REFERALAB.09@cmsidfc'}
              <button className="copy-button" onClick={copyToClipboard}>
                Copy
              </button>
            </p>
            <p>
              <strong>
                UTR : <input />
              </strong>{' '}
            </p>
            <button className="close-popup" onClick={handleClosePopup}>
              Close
            </button>
            &nbsp;
            <button className="close-popup" onClick={handleClosePopup}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
