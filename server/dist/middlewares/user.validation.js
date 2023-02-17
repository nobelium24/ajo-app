"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginValidationSchema = exports.userValidationSchema = void 0;
const yup = __importStar(require("yup"));
const userValidationSchema = yup.object().shape({
    firstName: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required first name').matches(/^[a-zA-Z]+$/),
    lastName: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required last name').matches(/^[a-zA-Z]+$/),
    userName: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required last name').matches(/^[a-zA-Z]+$/),
    email: yup.string().email("Invalid email address").required("Email is required email").matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
    password: yup.string().matches(/^.{8,}$/, 'Password must be at least 8 characters long.').required('Password is required.'),
});
exports.userValidationSchema = userValidationSchema;
const userLoginValidationSchema = yup.object().shape({
    email: yup.string().email("Invalid email address").required("Email is required email").matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
    userName: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required last name').matches(/^[a-zA-Z]+$/),
    password: yup.string().matches(/^.{8,}$/, 'Password must be at least 8 characters long.').required('Password is required.'),
});
exports.userLoginValidationSchema = userLoginValidationSchema;
