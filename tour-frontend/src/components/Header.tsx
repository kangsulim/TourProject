import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthModal } from "./Modal";
import LogoutButton from "./LogoutButton";
import AuthProvider from "../context/AuthContext";
import NotificationPopup from "../pages/Notifications/Notification";


export const Header: React.FC = () => {
  const authContext = useContext(AuthProvider);

  if (!authContext) {
    throw new Error('Header must be used within an AuthProvider');
  }

  const { isAuthenticated, user } = authContext; // user 정보 가져오기
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openSignupModal, setOpenSignupModal] = useState(false);

  const handleOpenLoginModal = () => setOpenLoginModal(true);
  const handleCloseLoginModal = () => setOpenLoginModal(false);
  const handleOpenSignupModal = () => {
    setOpenLoginModal(false);
    setOpenSignupModal(true);
  };
  const handleCloseSignupModal = () => setOpenSignupModal(false);
  const handleBackToLogin = () => {
    setOpenSignupModal(false);
    setOpenLoginModal(true);
  };

  return (
    <>
      <header
        style={{
          margin: "0",
          padding: "24px 40px 24px 48px",
          width: "100%",
          height: "80px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>🌍 어디로든 문</div>

        <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#333", fontSize: "1.1rem", fontWeight: "500" }}>홈</Link>
          <Link to="/plan" style={{ textDecoration: "none", color: "#333", fontSize: "1.1rem", fontWeight: "500" }}>여행 계획</Link>
          <Link to="/thread" style={{ textDecoration: "none", color: "#333", fontSize: "1.1rem", fontWeight: "500" }}>여행 게시판</Link>
          <Link to="/mypage" style={{ textDecoration: "none", color: "#333", fontSize: "1.1rem", fontWeight: "500" }}>마이페이지</Link>

          {/* 👇 관리자일 때만 보여줌 */}
          {user?.role === 'ADMIN' && (
            <Link to="/adminpage" style={{ textDecoration: "none", color: "#333", fontSize: "1.1rem", fontWeight: "500" }}>관리자 페이지</Link>
          )}
        </nav>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
            <LogoutButton />
            <NotificationPopup /> {/*  로그인한 사용자에만 종 아이콘 표시 7/11 */}
            </>
          ) : (
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976D2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                marginRight: "20px",
              }}
              onClick={handleOpenLoginModal}
            >
              로그인
            </button>
          )}
        </div>
      </header>

      <AuthModal
        openLogin={openLoginModal}
        openSignup={openSignupModal}
        onCloseLogin={handleCloseLoginModal}
        onCloseSignup={handleCloseSignupModal}
        onOpenSignup={handleOpenSignupModal}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
};
