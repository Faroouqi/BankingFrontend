import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

function GeeksforGeeks({message}) {
    const notify = () => {
        toast(message);
    };
    return (
        <></>
    );
}

export default GeeksforGeeks;