import React from 'react';
import styled from 'styled-components';
import CameraView from './CameraView';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height of the viewport */
  background: url('../background.jpg') no-repeat center center;
  background-size: cover;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1; /* Take up remaining space between header and footer */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LookLoginHeading = styled.h1`
  text-align: center;
  padding: 10px;
  margin: 0;
  background: linear-gradient(45deg, #007bff, #00d4ff);
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 5px solid #0056b3;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 15px;
  }
`;

const CameraSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* To position the image inside this section */
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 15px;
  }

  @media (max-width: 768px) {
    flex: none;
    height: 50%;
    padding: 10px;
  }

  @media (max-width: 480px) {
    height: auto;
    padding: 5px;
  }
`;

const MESImage = styled.img`
  position: absolute;
  top: 10px;
  left: 1050px; /* Start displaying after 400px from the left */
  width: 120px; /* Adjust the size of the image */
  height: auto;
  opacity: 0.4; /* Lower opacity for watermark effect */
  filter: grayscale(100%); /* Apply grayscale filter */
  z-index: -1; /* Ensure it appears behind other content */

  @media (max-width: 768px) {
    width: 200px; /* Adjust size for smaller screens */
    left: 200px; /* Adjust left position for smaller screens */
  }

  @media (max-width: 480px) {
    width: 150px; /* Adjust size for very small screens */
    left: 100px; /* Adjust left position for very small screens */
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex: none;
    height: 50%;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  color: #333;
  font-size: 14px;
  border-top: 2px solid #007bff;

  p {
    margin: 5px 0;
  }

  strong {
    color: #007bff;
  }
`;

const Home = () => {
  return (
    <Container>
      <LookLoginHeading>LookLogin</LookLoginHeading>
      <ContentWrapper>
        <CameraSection>
          <CameraView />
          <MESImage src={`${process.env.PUBLIC_URL}/MES.png`} alt="MES Logo" />
        </CameraSection>
        <FormSection>
          {/* <LoginForm /> */}
        </FormSection>
      </ContentWrapper>
      <Footer>
        <p>
          Team : &nbsp; <strong> Syeda Fariyal </strong>, 
          <strong> Amulya H A</strong> <strong> & Dimple Patel P </strong>
        </p>
        <p>
          Guide : <b> Priya V N</b>, Department of BCA
        </p>
        <p>SBRR MAHAJANA FIRST GRADE COLLEGE, Mysuru</p>
      </Footer>
    </Container>
  );
};

export default Home;