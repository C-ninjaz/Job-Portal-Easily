export function lastVisitCookie(req, res, next) {
  const prev = req.cookies.lastVisit;
  const now = Date.now().toString();
  res.cookie("lastVisit", now, {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  next();
}
