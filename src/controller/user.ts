import { getRepository } from "typeorm";
import { User } from "../model/User";
import { sign } from "../Utils/jwt";
import { hashPass, matchPass } from "../Utils/password";
import { sanitization } from "../Utils/security";

interface registerData{
    username: string,
    password: string,
    email:string
}

interface loginData{
    email: string,
    password: string
}

interface updateData{
    username: string,
    password: string,
    email:string
}

export async function getAllUsers(): Promise<User[]> {
    const repo = getRepository(User);

    const users = await repo.find();

    return users;
}


export async function registerUsers(data: registerData): Promise<User> {
    //validation
    if(!data.email) throw new Error("email field is empty");
    if(!data.password) throw new Error("password field is empty");
    if(!data.username) throw new Error("username field is empty");
    
    try {
        const repo = getRepository(User);
        const user = await repo.save(new User(
            data.username,
            data.email,
            await hashPass(data.password)
        ));

        return await sanitization(user);
    } catch (e) {
        throw e
    }
}

export async function loginUser(data: loginData): Promise<User> {
    //vaidation
    if(!data.email) throw new Error("email field is empty");
    if(!data.password) throw new Error("password field is empty");

    try {
    const repo = getRepository(User);
    const user = await repo.findOne(data.email);

    if(!user) throw new Error("No user with this email found");

    //match password
    const passMatch = await matchPass(data.password, user.password!!);
    if(!passMatch) throw new Error("password does not match");

    user.token = await sign(user);
    return await sanitization(user); 

    } catch (e) {
        throw e
    }
}

export async function updateUser(data: updateData, email: string): Promise<User> {

    try {
        const repo = getRepository(User);

        const user = await repo.findOne(email);
        if(!user) throw new Error("no user found");

        if(data.email) user.email = data.email;
        if(data.username) user.username = data.username;
        if(data.password) user.password = await hashPass(data.password);
        
        const updatedUser = await repo.save(user);
        return (updatedUser);
    } catch (e) {
        throw e;
    }
}

export async function deleteUser(email: string) {
    try {
        const repo = getRepository(User)
        const user = await repo.findOne(email);

        if(!user) throw new Error("no user found");

        repo.delete(user);
    } catch (e) {
        throw e;
    }
}