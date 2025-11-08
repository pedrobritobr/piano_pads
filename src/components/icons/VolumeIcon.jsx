export default function PlayIcon({ size = 24, color = "#09244B" }) {
  return (
    <svg
      viewBox="0 0 800 800"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M363.9,288.4L468,201.7c32.6-27.1,82-4,82,38.4v319.8c0,42.4-49.4,65.6-82,38.4l-104.1-86.7
        c-9-7.5-20.3-11.6-32-11.6h-65.2c-27.6,0-50-22.4-50-50V350c0-27.6,22.4-50,50-50h65.2C343.6,300,354.9,295.9,363.9,288.4z"
        stroke={color}
        strokeWidth="66.6667"
        strokeMiterlimit="133.3333"
        fill="none"
      />
    </svg>
  );
}
