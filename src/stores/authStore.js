
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, sendEmailVerification } from "firebase/auth";
import { writable } from "svelte/store";
import { auth } from "../lib/firebase";
import { createUser } from "../lib/firebase";


export const authStore = writable({
    isLoading: true,
    currentUser: null
})

export const authHandlers = {
    login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (!user.emailVerified) {
            throw new Error('Email not verified');
        }
    },
    signup: async (email, password, firstName, lastName) => {
        await createUser(email, password, firstName, lastName)
        window.location.href = '/'
    },
    logout: async () => {
        await signOut(auth)
    },
    resetPassword: async (email) => {
        console.log('WE ARE HERE', email)
        if (!email) {
            console.log('inHERE')
            return
        }
        await sendPasswordResetEmail(auth, email)
    },
    updateEmail: async (email) => {
        authStore.update(curr => {
            return {
                ...curr, currentUser: {
                    ...curr.currentUser, email: email
                }
            }
        })
        await updateEmail(auth.currentUser, email)
    },
    updatePassword: async (password) => {
        await updatePassword(auth.currentUser, password)
    },
    verifyEmail: async () => {
        await sendEmailVerification(auth.currentUser)
    }
}
