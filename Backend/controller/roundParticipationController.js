// controller/roundParticipationController.js
import RoundParticipation from "../models/RoundParticipation.js";
import Student from "../models/Student.js";

const RoundParticipationController = {
    insertParticipation: async (req, res) => {
        try {
            const result = await RoundParticipation.insert(req.body);
            if (result.error) throw new Error(result.error);
            res.status(201).json({ message: "Participation added successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllParticipations: async (req, res) => {
        try {
            const participations = await RoundParticipation.getAll();
            res.json(participations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getParticipationsByRoundId: async (req, res) => {
        try {
            const participations = await RoundParticipation.getByRoundId(
                req.params.round_id
            );
            res.json(participations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteParticipationById: async (req, res) => {
        try {
            await RoundParticipation.deleteById(req.params.participation_id);
            res.json({ message: "Participation deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getStudentsByRoundId: async (req, res) => {
        try {
            const students = await RoundParticipation.getStudentsByRoundId(
                req.params.round_id
            );
            if (students.error) throw new Error(students.error);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getStudentsDetailsByRoundId: async (req, res) => {
        try {
            const students = await RoundParticipation.getStudentsDetailsByRoundId(
                req.params.round_id
            );
            if (students.error) throw new Error(students.error);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteByRoundAndStudent: async (req, res) => {
        try {
            const { round_id, student_id } = req.body;
            const result = await RoundParticipation.deleteByRoundAndStudent(round_id, student_id);
            if (result.error) throw new Error(result.error);
            res.json({ message: "Student deleted from round successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default RoundParticipationController;