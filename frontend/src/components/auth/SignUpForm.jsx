import React, { useState } from 'react';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {axiosInstance} from "../../lib/axios.js";
import {toast} from "react-hot-toast";
import {Loader} from "lucide-react";

const SignUpForm = () => {
    //states to keep track of user data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const queryClient = useQueryClient();

    const {mutate: signUpMutation, isLoading} = useMutation({
        mutationFn: async(data) => {//defualt way&data coz we're sending data
            const res = await axiosInstance.post("/auth/signup", data);//connecting to backend api with data from frontend
            return res.data //getting json resp. back from api
        },
        onSuccess: () => {
            toast.success("Account created successfully");
            //redirect to home page with fetching his data
            queryClient.invalidateQueries({queryKey:["authUser"]});
        },
        onError: (err) => {
            toast.error(err.response.data.message || "Something went wrong")
        }
    })

    const handleSignUp = (e) => {
        e.preventDefault(); //doesn't refresh page

        signUpMutation({name,email,username,password})
    }

    return <form onSubmit={handleSignUp} className='flex flex-col gap-4'>

        <input type='text' placeholder='Full Name'
            value={name} onChange={(e) => setName(e.target.value)}
            className='input input-bordered w-full' required />

        <input type='text' placeholder='Username'
            value={username} onChange={(e) => setUsername(e.target.value)}
            className='input input-bordered w-full' required />

        <input type='email' placeholder='Email'
            value={email} onChange={(e) => setEmail(e.target.value)}
            className='input input-bordered w-full' required />

        <input type='password' placeholder='Password'
            value={password} onChange={(e) => setPassword(e.target.value)}
            className='input input-bordered w-full' required />
        <button type='submit' disabled={isLoading} className='btn btn-primary w-full text-white'>
            {isLoading ? <Loader className='size-5 animate-spin'/>: "Agree & Join"}
        </button>

    </form>
}

export default SignUpForm;