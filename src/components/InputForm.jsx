import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Table, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./form.css";
import Header from "./Header";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const DataUpt = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    fetchData();
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
    const updatedData = data.map((row) => {
      if (row.id_upt === rowId) {
        return {
          ...row,
          isChecked: !row.isChecked,
        };
      }
      return row;
    });
    setData(updatedData);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Update the absensi field for each row
    data.forEach((row) => {
      const updatedRow = {
        ...row,
        absensi: row.isChecked ? "Hadir" : "Tidak Hadir",
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
    const updatedData = data.map((row) => ({
      ...row,
      isChecked: false,
    }));
    setData(updatedData);
  };

  const handleNavigate = () => {
    navigate("/activity");
  };

  return (
    <div>
      <div className="header-container">
      <Header />
      <div className="timestamp-container">
        <Card className="timestamp-card">
          <Card.Body>
            <Card.Text>{currentTime.format("D MMMM YYYY, h:mm:ss a")}</Card.Text>
          </Card.Body>
        </Card>
      </div>
      </div>
      <Button className="my-1" onClick={handleNavigate}>
        Ganti Kegiatan
      </Button>
      <div className="container-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" onClick={handleSearch}>
          <i className="fas fa-search"></i>
        </button>
      </div>
      <Form onSubmit={handleSubmit}>
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
                    checked={row.isChecked}
                    onChange={() => handleCheckboxChange(row.id_upt)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
