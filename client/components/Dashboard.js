// Dashboard.js
import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;

  @media (max-width: 768px) {
    margin-top: 50px;
  }
`;

function Dashboard() {
  return (
    <DashboardContainer>
      <h2>Dashboard</h2>
      {/* Add dashboard content */}
    </DashboardContainer>
  );
}

export default Dashboard;