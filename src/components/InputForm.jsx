import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Table, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./form.css";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { TextField } from "@mui/material";

const DataUpt = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment());
  const [selectedData, setSelectedData] = useState([]); // State variable to store selected data
  const [uncheckedData, setUncheckedData] = useState([]); // State variable to store unchecked data
  const [dataAct, setDataAct] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchDataAct();
    const storedSelectedRows = localStorage.getItem("selectedRows");
    if (storedSelectedRows) {
      setSelectedRows(JSON.parse(storedSelectedRows));
    }

    // Update the current time every second
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
  }, [selectedRows]);

useEffect(() => {
  // Update the selected data whenever selectedRows or data change
  const updatedSelectedData = data
    .filter((row) => selectedRows.includes(row.id_upt))
    .map((row) => row.nama_upt);
  setSelectedData(updatedSelectedData);

  const updatedUncheckedData = data
    .filter((row) => !selectedRows.includes(row.id_upt))
    .map((row) => row.nama_upt);
  setUncheckedData(updatedUncheckedData);
}, [selectedRows, data]);

  const fetchData = () => {
    let apiUrl = "http://localhost:5000/api/dataUpt";
    if (searchQuery) {
      apiUrl = `http://localhost:5000/api/dataUpt/search?q=${searchQuery}`;
    }
    axios
      .get(apiUrl)
      .then((response) => {
        const updatedData = response.data.map((row) => ({
          ...row,
          isChecked: row.absensi === "Hadir",
        }));
        setData(updatedData);
      })
      .catch((err) => console.error(err));
  };

  const handleCheckboxChange = (rowId) => {
    const updatedRows = [...selectedRows];
    const rowIndex = updatedRows.indexOf(rowId);
    if (rowIndex > -1) {
      updatedRows.splice(rowIndex, 1);
    } else {
      updatedRows.push(rowId);
    }
    setSelectedRows(updatedRows);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Update the absensi field for each row
    data.forEach((row) => {
      const updatedRow = {
        ...row,
        absensi: selectedRows.includes(row.id_upt) ? "Hadir" : "Tidak Hadir",
      };

      axios
        .put(`http://localhost:5000/api/dataUpt/${row.id_upt}`, updatedRow)
        .then((response) => {
          console.log(response.data); // Log the response if needed
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    });

    setShowAlert(true); // Show the alert
    setTimeout(() => {
      setShowAlert(false); // Hide the alert after 1 second
      navigate("/output"); // Navigate to the output page
    }, 1500);
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearAll = () => {
    setSelectedRows([]);
  };

    const fetchDataAct = () => {
    axios
      .get("http://localhost:5000/api/dataAct")
      .then((res) => setDataAct(res.data[0]))
      .catch((err) => console.log(err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDataAct((prevDataAct) => ({
      ...prevDataAct,
      [name]: value,
    }));
  };

  const handleSubmitAct = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/dataAct",
        dataAct
      );
      if (response.data) {
        alert(response.data.message);
        navigate("/");
        return;
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  return (
    <div>
      <h1 style={{ textAlign:"center"}}>Absensi UPT</h1>
      <div className="header-container">
        <div className="form-control-card">
            <Card.Body>
              <Form onSubmit={handleSubmitAct}>
                <div className="d-flex justify-content-between"> {/* Add this div */}
                  <Form.Group controlId="formNamaKegiatan">
                    <Form.Label>Nama Kegiatan</Form.Label>
                    <Form.Control
                      type="text"
                      name="nama_kegiatan"
                      value={dataAct.nama_kegiatan}
                      onChange={handleInputChange}
                      placeholder="Masukkan Nama Kegiatan"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" style={{ marginTop: "30px", height: "40px"}}>
                    Simpan
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </div>
        <div className="timestamp-container">
          <Card className="timestamp-card">
            <Card.Body>
              <Card.Text>{currentTime.format("D MMMM YYYY, h:mm:ss a")}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="container-search">
        <input
          type="text"
          placeholder="Cari UPT..."
          value={searchQuery}
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" onClick={handleSearch}>
          <i className="fas fa-search"></i>
        </button>
      </div>
      <div className="containers">
      <Form onSubmit={handleSubmit}>
      <div className="table-container">
        <Table striped bordered hover className="modern-table">
          <thead>
            <tr>
              <th>Nomor Upt</th>
              <th>Nama Upt</th>
              <th>Absensi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id_upt}>
                <td>{row.id_upt}</td>
                <td>{row.nama_upt}</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedRows.includes(row.id_upt)}
                    onChange={() => handleCheckboxChange(row.id_upt)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
        <div className="d-flex justify-content-end">
          <Button
            type="button"
            variant="secondary"
            className="mt-2 mb-2 mr-2"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Button type="submit" variant="primary" className="mt-2 mb-2 mx-4">
            Submit
          </Button>
      </div>
      </Form>
        <div className="textbox-container">
          <div className="result-container">
            {selectedData.length >= 0 && ( // Change the condition to selectedData.length >= 0
              <TextField
                id="selected-rows"
                label="Hadir"
                multiline
                rows={10}
                value={dataAct.nama_kegiatan + "\n\nHadir : \n" +  selectedData.join("\n")}
                variant="outlined"
                style={{ width: "100%" }}
              />
            )}
            {uncheckedData.length > 0 && (
              <TextField
                id="unchecked-rows"
                label="Tidak Hadir"
                multiline
                rows={10}
                value={dataAct.nama_kegiatan + "\n\nTidak Hadir : \n" + uncheckedData.join("\n")}
                variant="outlined"
                style={{ width: "100%", marginTop: "20px" }}
              />
            )}
          </div>
        </div>

      </div>
      <Snackbar
        open={showAlert}
        autoHideDuration={1000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Set the anchor origin to top center
      >
        <MuiAlert
          onClose={() => setShowAlert(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Berhasil Menyimpan Data
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default DataUpt;
