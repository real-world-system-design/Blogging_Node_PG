import {Router} from 'express';
import { postComment } from '../controller/comment';
import { authByToken } from '../middleware/auth';

const route = Router();

route.post('/:slug/comments', authByToken,async(req, res) => {
    try {
        const comment = await postComment(req.body, (req as any).user.email, req.params.slug);
        res.status(200).send(comment);        
    } catch (e) {
        res.status(500).send(e);
    }
})

export const commentRoute = route; 