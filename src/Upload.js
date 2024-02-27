import axios from "axios";
import { useRef } from "react";
import "./css/Upload.css";

const Upload = () => {
  const h1Ref = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const excelFile = e.target.file.files[0];

    if (!excelFile) return;

    h1Ref.current.textContent = "Lähetetään tiedostoa...";

    const formData = new FormData();
    formData.append("file", excelFile);

    axios
      .post("http://localhost:3001/api/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          h1Ref.current.textContent = "Tiedosto lähetetty onnistuneesti!";
        }
      })
      .catch(
        () =>
          (h1Ref.current.textContent =
            "Tiedoston lähetyksen aikana tapahtui virhe")
      );
  };

  return (
    <section className="upload">
      <form
        action=""
        method="post"
        encType="multipart/form-data"
        onSubmit={(e) => handleSubmit(e)}
      >
        <h1 ref={h1Ref}>Lähetä matriisi tiedosto tietokantaan</h1>
        <input type="file" name="file" accept=".xlsx" />
        <button type="submit">Lähetä</button>
      </form>
    </section>
  );
};

export default Upload;
