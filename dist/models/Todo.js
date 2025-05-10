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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Priority = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
})(Priority || (exports.Priority = Priority = {}));
var Status;
(function (Status) {
    Status["TODO"] = "todo";
    Status["IN_PROGRESS"] = "in_progress";
    Status["DONE"] = "done";
})(Status || (exports.Status = Status = {}));
const TodoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxLength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.TODO,
    },
    priority: {
        type: String,
        enum: Object.values(Priority),
        default: Priority.MEDIUM,
    },
    dueDate: {
        type: Date,
    },
    userId: {
        type: String,
        required: true,
        index: true, // Index for faster lookups by userId
    },
}, {
    timestamps: true,
});
TodoSchema.index({ userId: 1 });
exports.default = mongoose_1.default.model("Todo", TodoSchema);
