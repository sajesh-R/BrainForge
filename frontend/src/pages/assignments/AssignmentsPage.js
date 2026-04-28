import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssignmentModule from './AssignmentModule';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';

const AssignmentsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <DiscoveryLayout>
            <button
                onClick={() => navigate(`/courses/${id}`)}
                className="btn-secondary"
                style={{ width: 'auto', display: 'inline-flex', marginBottom: '24px', padding: '8px 16px' }}
            >
                &larr; Back to Course
            </button>
            <AssignmentModule courseId={id} />
        </DiscoveryLayout>
    );
};

export default AssignmentsPage;
