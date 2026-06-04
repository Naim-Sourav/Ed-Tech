
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { Menu, ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PorikkhangonAI from './components/PorikkhangonAI';
import OnboardingModal from './components/OnboardingModal';
import { fetchNotificationsAPI } from './services/api';
import { Notification } from './types';
import { subscribeToPushNotifications, onForegroundMessage, checkSubscription } from './services/notificationService';

import ErrorBoundary from './components/ErrorBoundary';

// --- Lazy Load Helper with Retry Logic ---
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // A stub to prevent infinite loops
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null }; // Return a dummy component while reloading
      }

      // The error is real and the page has already been refreshed
      throw error;
    }
  });

// --- Lazy Load Components ---
const HomeDashboard = lazyWithRetry(() => import('./components/HomeDashboard'));
const QuizArena = lazyWithRetry(() => import('./components/QuizArena'));
const ExamPage = lazyWithRetry(() => import('./components/ExamPage'));
const AdmissionSearch = lazyWithRetry(() => import('./components/AdmissionSearch'));
const QuizBattlePrototype = lazyWithRetry(() => import('./components/QuizBattlePrototype'));
const CourseSection = lazyWithRetry(() => import('./components/CourseSection'));
const QuestionBank = lazyWithRetry(() => import('./components/QuestionBank'));
const ProfilePage = lazyWithRetry(() => import('./components/ProfilePage'));
const SavedQuestions = lazyWithRetry(() => import('./components/SavedQuestions'));
const WrongQuestions = lazyWithRetry(() => import('./components/WrongQuestions'));
const ExamHistory = lazyWithRetry(() => import('./components/ExamHistory'));
const AdminPage = lazyWithRetry(() => import('./components/AdminPage'));
const LeaderboardPage = lazyWithRetry(() => import('./components/LeaderboardPage'));
const DailyChallengePage = lazyWithRetry(() => import('./components/DailyChallengePage'));
const ExamHub = lazyWithRetry(() => import('./components/ExamHub'));
const ExamBatchPage = lazyWithRetry(() => import('./components/ExamBatchPage'));
const PaymentPage = lazyWithRetry(() => import('./components/PaymentPage'));

const PageLoader = () => (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center bg-transparent text-gray-400">
    <div className="w-24 h-24 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-full h-full overflow-visible" zoomAndPan="magnify" viewBox="0 0 1500 1500" preserveAspectRatio="xMidYMid meet" version="1.0">
        <defs>
          <clipPath id="c18f77efe4"><path d="M 67.089844 2.730469 L 729.125 2.730469 L 729.125 953.699219 L 67.089844 953.699219 Z M 67.089844 2.730469 " clipRule="nonzero"/></clipPath>
          <clipPath id="535055ba75"><path d="M 0.363281 724.9375 L 312.695312 724.9375 L 312.695312 1037.269531 L 0.363281 1037.269531 Z M 0.363281 724.9375 " clipRule="nonzero"/></clipPath>
          <clipPath id="a748015d0a"><path d="M 156.53125 724.9375 C 70.28125 724.9375 0.363281 794.855469 0.363281 881.101562 C 0.363281 967.351562 70.28125 1037.269531 156.53125 1037.269531 C 242.777344 1037.269531 312.695312 967.351562 312.695312 881.101562 C 312.695312 794.855469 242.777344 724.9375 156.53125 724.9375 Z M 156.53125 724.9375 " clipRule="nonzero"/></clipPath>
          <clipPath id="02d640222f"><path d="M 0.363281 0.9375 L 312.695312 0.9375 L 312.695312 313.269531 L 0.363281 313.269531 Z M 0.363281 0.9375 " clipRule="nonzero"/></clipPath>
          <clipPath id="f1e912bc1d"><path d="M 156.53125 0.9375 C 70.28125 0.9375 0.363281 70.855469 0.363281 157.101562 C 0.363281 243.351562 70.28125 313.269531 156.53125 313.269531 C 242.777344 313.269531 312.695312 243.351562 312.695312 157.101562 C 312.695312 70.855469 242.777344 0.9375 156.53125 0.9375 Z M 156.53125 0.9375 " clipRule="nonzero"/></clipPath>
          <clipPath id="272f9da2fa"><rect x="0" width="313" y="0" height="314"/></clipPath>
          <clipPath id="e724f3ca2c"><path d="M 67.089844 791.664062 L 245.96875 791.664062 L 245.96875 970.542969 L 67.089844 970.542969 Z M 67.089844 791.664062 " clipRule="nonzero"/></clipPath>
          <clipPath id="27ae62e6c2"><path d="M 156.53125 791.664062 C 107.132812 791.664062 67.089844 831.707031 67.089844 881.101562 C 67.089844 930.5 107.132812 970.542969 156.53125 970.542969 C 205.925781 970.542969 245.96875 930.5 245.96875 881.101562 C 245.96875 831.707031 205.925781 791.664062 156.53125 791.664062 Z M 156.53125 791.664062 " clipRule="nonzero"/></clipPath>
          <clipPath id="bd5a1f1cc3"><path d="M 0.0898438 0.664062 L 178.96875 0.664062 L 178.96875 179.542969 L 0.0898438 179.542969 Z M 0.0898438 0.664062 " clipRule="nonzero"/></clipPath>
          <clipPath id="d12d5e9a15"><path d="M 89.53125 0.664062 C 40.132812 0.664062 0.0898438 40.707031 0.0898438 90.101562 C 0.0898438 139.5 40.132812 179.542969 89.53125 179.542969 C 138.925781 179.542969 178.96875 139.5 178.96875 90.101562 C 178.96875 40.707031 138.925781 0.664062 89.53125 0.664062 Z M 89.53125 0.664062 " clipRule="nonzero"/></clipPath>
          <clipPath id="c76e1fc440"><rect x="0" width="179" y="0" height="180"/></clipPath>
          <clipPath id="1172838d48"><rect x="0" width="731" y="0" height="1038"/></clipPath>
          <mask id="cutout-mask">
            <rect x="-1000" y="-1000" width="4000" height="4000" fill="#ffffff" />
            <g clipPath="url(#535055ba75)">
              <g clipPath="url(#a748015d0a)">
                <g transform="matrix(1, 0, 0, 1, -0.000000000000056843, 724)">
                  <g clipPath="url(#272f9da2fa)">
                    <g clipPath="url(#02d640222f)">
                      <g clipPath="url(#f1e912bc1d)">
                        <path fill="#000000" d="M 0.363281 0.9375 L 312.695312 0.9375 L 312.695312 313.269531 L 0.363281 313.269531 Z M 0.363281 0.9375 " fillOpacity="1" fillRule="nonzero"/>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </mask>
        </defs>

        <g transform="matrix(1, 0, 0, 1, 385, 230)">
          <g>
            {/* কালো P শেপ (ডাইনামিক ডার্ক মোড সাপোর্ট সহ) */}
            <g className="animate-bump">
              <g mask="url(#cutout-mask)">
                <g clipPath="url(#c18f77efe4)">
                  {/* এখানে আপনার আসল SVG এর P শেপের বিশাল লম্বা d="..." পাথটি বসাবেন */}
                  <path 
                    className="fill-gray-900 dark:fill-white" 
                    d="M 729.535156 347.402344 C 729.695312 354.636719 729.636719 361.867188 729.351562 369.09375 C 729.066406 376.320312 728.558594 383.535156 727.832031 390.730469 C 727.101562 397.925781 726.152344 405.09375 724.984375 412.234375 C 723.8125 419.371094 722.425781 426.464844 720.820312 433.519531 C 719.210938 440.574219 717.390625 447.570312 715.351562 454.507812 C 713.316406 461.449219 711.066406 468.320312 708.605469 475.125 C 706.144531 481.925781 703.476562 488.644531 700.601562 495.285156 C 697.726562 501.921875 694.652344 508.464844 691.375 514.914062 C 688.097656 521.359375 684.625 527.703125 680.957031 533.9375 C 677.289062 540.171875 673.429688 546.289062 669.386719 552.285156 C 665.34375 558.28125 661.117188 564.148438 656.710938 569.886719 C 652.304688 575.621094 647.726562 581.21875 642.976562 586.671875 C 638.226562 592.128906 633.3125 597.433594 628.234375 602.585938 C 623.160156 607.738281 617.925781 612.726562 612.542969 617.558594 C 607.160156 622.390625 601.632812 627.050781 595.960938 631.539062 C 590.289062 636.027344 584.484375 640.339844 578.546875 644.472656 C 572.609375 648.605469 566.550781 652.550781 560.371094 656.308594 C 554.191406 660.070312 547.902344 663.636719 541.503906 667.007812 C 535.105469 670.378906 528.605469 673.550781 522.011719 676.523438 C 515.417969 679.496094 508.738281 682.261719 501.972656 684.824219 C 495.207031 687.382812 488.371094 689.734375 481.460938 691.875 C 474.550781 694.011719 467.582031 695.9375 460.554688 697.648438 C 453.523438 699.359375 446.449219 700.851562 439.328125 702.128906 C 432.210938 703.402344 425.058594 704.457031 417.871094 705.292969 C 410.6875 706.125 403.484375 706.738281 396.257812 707.128906 C 389.035156 707.519531 381.808594 707.6875 374.574219 707.632812 C 367.34375 707.578125 360.117188 707.304688 352.902344 706.804688 C 345.683594 706.304688 338.492188 705.585938 331.320312 704.640625 C 324.148438 703.699219 317.011719 702.539062 309.910156 701.15625 C 302.808594 699.773438 295.757812 698.175781 288.757812 696.359375 C 281.753906 694.542969 274.816406 692.515625 267.9375 690.273438 C 261.0625 688.027344 254.261719 685.578125 247.535156 682.914062 L 247.535156 863.796875 C 247.535156 865.273438 247.5 866.75 247.425781 868.226562 C 247.355469 869.699219 247.246094 871.171875 247.101562 872.640625 C 246.957031 874.109375 246.777344 875.578125 246.558594 877.035156 C 246.34375 878.496094 246.09375 879.953125 245.804688 881.398438 C 245.515625 882.847656 245.191406 884.289062 244.835938 885.722656 C 244.476562 887.152344 244.082031 888.578125 243.652344 889.988281 C 243.226562 891.402344 242.761719 892.804688 242.265625 894.195312 C 241.769531 895.585938 241.238281 896.960938 240.671875 898.328125 C 240.109375 899.691406 239.507812 901.039062 238.878906 902.375 C 238.246094 903.710938 237.582031 905.027344 236.886719 906.332031 C 236.191406 907.632812 235.464844 908.917969 234.707031 910.183594 C 233.945312 911.453125 233.15625 912.699219 232.335938 913.925781 C 231.515625 915.15625 230.667969 916.363281 229.789062 917.546875 C 228.90625 918.734375 228 919.898438 227.0625 921.039062 C 226.125 922.179688 225.164062 923.296875 224.171875 924.390625 C 223.179688 925.488281 222.160156 926.554688 221.117188 927.601562 C 220.074219 928.644531 219.003906 929.664062 217.910156 930.652344 C 216.816406 931.644531 215.699219 932.609375 214.558594 933.546875 C 213.417969 934.484375 212.253906 935.390625 211.066406 936.273438 C 209.882812 937.152344 208.675781 938 207.445312 938.820312 C 206.21875 939.640625 204.972656 940.433594 203.707031 941.191406 C 202.4375 941.949219 201.15625 942.679688 199.851562 943.375 C 198.550781 944.070312 197.230469 944.734375 195.898438 945.367188 C 194.5625 945.996094 193.210938 946.59375 191.847656 947.160156 C 190.484375 947.726562 189.105469 948.257812 187.71875 948.753906 C 186.328125 949.253906 184.925781 949.714844 183.511719 950.144531 C 182.097656 950.574219 180.675781 950.964844 179.242188 951.324219 C 177.8125 951.683594 176.371094 952.007812 174.921875 952.296875 C 173.476562 952.582031 172.019531 952.835938 170.558594 953.050781 C 169.097656 953.269531 167.632812 953.449219 166.164062 953.59375 C 164.695312 953.738281 163.222656 953.847656 161.75 953.921875 C 160.273438 953.992188 158.796875 954.03125 157.320312 954.03125 C 155.84375 954.03125 154.367188 953.992188 152.894531 953.921875 C 151.417969 953.847656 149.945312 953.742188 148.476562 953.597656 C 147.007812 953.453125 145.542969 953.273438 144.082031 953.054688 C 142.621094 952.839844 141.164062 952.585938 139.714844 952.296875 C 138.269531 952.011719 136.828125 951.6875 135.394531 951.328125 C 133.960938 950.96875 132.539062 950.578125 131.125 950.148438 C 129.714844 949.71875 128.3125 949.257812 126.921875 948.757812 C 125.53125 948.261719 124.152344 947.730469 122.789062 947.164062 C 121.425781 946.601562 120.074219 946.003906 118.738281 945.371094 C 117.402344 944.738281 116.085938 944.078125 114.78125 943.378906 C 113.480469 942.683594 112.195312 941.957031 110.929688 941.199219 C 109.664062 940.4375 108.414062 939.648438 107.1875 938.828125 C 105.960938 938.007812 104.753906 937.15625 103.566406 936.277344 C 102.378906 935.398438 101.214844 934.492188 100.074219 933.554688 C 98.933594 932.617188 97.816406 931.652344 96.71875 930.660156 C 95.625 929.667969 94.558594 928.652344 93.511719 927.605469 C 92.46875 926.5625 91.449219 925.492188 90.457031 924.398438 C 89.46875 923.304688 88.503906 922.1875 87.566406 921.046875 C 86.628906 919.902344 85.722656 918.738281 84.839844 917.554688 C 83.960938 916.367188 83.113281 915.160156 82.289062 913.933594 C 81.46875 912.703125 80.679688 911.457031 79.921875 910.191406 C 79.164062 908.921875 78.433594 907.640625 77.738281 906.335938 C 77.042969 905.035156 76.378906 903.714844 75.746094 902.378906 C 75.117188 901.046875 74.519531 899.695312 73.953125 898.332031 C 73.386719 896.964844 72.855469 895.589844 72.359375 894.199219 C 71.863281 892.808594 71.398438 891.40625 70.972656 889.992188 C 70.542969 888.578125 70.148438 887.15625 69.789062 885.722656 C 69.433594 884.292969 69.109375 882.851562 68.820312 881.402344 C 68.53125 879.953125 68.28125 878.5 68.0625 877.039062 C 67.847656 875.578125 67.667969 874.113281 67.523438 872.644531 C 67.378906 871.171875 67.269531 869.699219 67.199219 868.226562 C 67.125 866.75 67.089844 865.273438 67.089844 863.796875 L 67.089844 519.601562 C 67.089844 518.125 67.125 516.652344 67.199219 515.175781 C 67.269531 513.703125 67.378906 512.230469 67.523438 510.761719 C 67.667969 509.292969 67.847656 507.828125 68.066406 506.367188 C 68.28125 504.90625 68.535156 503.453125 68.824219 502.007812 C 69.109375 500.558594 69.433594 499.117188 69.792969 497.6875 C 70.152344 496.253906 70.546875 494.832031 70.972656 493.421875 C 71.402344 492.007812 71.863281 490.605469 72.363281 489.214844 C 72.859375 487.828125 73.390625 486.449219 73.957031 485.085938 C 74.519531 483.722656 75.117188 482.375 75.75 481.039062 C 76.378906 479.703125 77.042969 478.386719 77.738281 477.085938 C 78.4375 475.78125 79.164062 474.5 79.921875 473.234375 C 80.679688 471.964844 81.46875 470.71875 82.289062 469.492188 C 83.109375 468.265625 83.960938 467.058594 84.839844 465.875 C 85.71875 464.6875 86.625 463.523438 87.5625 462.382812 C 88.5 461.242188 89.464844 460.125 90.453125 459.03125 C 91.445312 457.9375 92.464844 456.867188 93.507812 455.824219 C 94.550781 454.78125 95.621094 453.761719 96.714844 452.773438 C 97.808594 451.78125 98.925781 450.816406 100.066406 449.878906 C 101.207031 448.945312 102.371094 448.035156 103.554688 447.15625 C 104.742188 446.277344 105.949219 445.429688 107.175781 444.609375 C 108.402344 443.789062 109.648438 443 110.914062 442.238281 C 112.179688 441.480469 113.464844 440.753906 114.765625 440.058594 C 116.070312 439.363281 117.386719 438.699219 118.722656 438.066406 C 120.054688 437.4375 121.40625 436.839844 122.769531 436.273438 C 124.132812 435.707031 125.507812 435.175781 126.898438 434.679688 C 128.289062 434.183594 129.691406 433.71875 131.101562 433.292969 C 132.515625 432.863281 133.9375 432.46875 135.367188 432.109375 C 136.800781 431.75 138.242188 431.429688 139.6875 431.140625 C 141.136719 430.851562 142.589844 430.601562 144.050781 430.382812 C 145.511719 430.167969 146.976562 429.988281 148.445312 429.84375 C 149.914062 429.695312 151.382812 429.589844 152.859375 429.515625 C 154.332031 429.445312 155.808594 429.40625 157.285156 429.40625 C 159.882812 429.40625 162.460938 429.554688 165 429.773438 C 167.652344 429.554688 170.339844 429.40625 173.082031 429.40625 C 176.421875 429.398438 179.753906 429.574219 183.074219 429.9375 C 186.394531 430.296875 189.683594 430.84375 192.941406 431.574219 C 196.203125 432.304688 199.410156 433.214844 202.566406 434.304688 C 205.726562 435.394531 208.8125 436.65625 211.828125 438.089844 C 214.84375 439.523438 217.773438 441.121094 220.609375 442.882812 C 223.449219 444.644531 226.179688 446.5625 228.800781 448.628906 C 231.425781 450.695312 233.925781 452.902344 236.304688 455.25 C 238.679688 457.597656 240.917969 460.070312 243.019531 462.667969 C 244.417969 464.421875 245.855469 466.148438 247.324219 467.847656 C 248.792969 469.546875 250.292969 471.214844 251.828125 472.855469 C 253.363281 474.496094 254.929688 476.105469 256.527344 477.683594 C 258.125 479.261719 259.75 480.808594 261.410156 482.324219 C 263.066406 483.835938 264.753906 485.320312 266.472656 486.765625 C 268.1875 488.214844 269.929688 489.628906 271.703125 491.011719 C 273.476562 492.390625 275.273438 493.734375 277.097656 495.046875 C 278.921875 496.355469 280.769531 497.628906 282.644531 498.867188 C 284.519531 500.101562 286.417969 501.304688 288.339844 502.464844 C 290.261719 503.628906 292.203125 504.753906 294.167969 505.839844 C 296.132812 506.925781 298.121094 507.972656 300.125 508.984375 C 302.132812 509.992188 304.160156 510.960938 306.203125 511.890625 C 308.246094 512.820312 310.308594 513.707031 312.390625 514.558594 C 314.46875 515.40625 316.5625 516.214844 318.675781 516.980469 C 320.785156 517.746094 322.910156 518.472656 325.050781 519.15625 C 327.191406 519.835938 329.339844 520.476562 331.507812 521.078125 C 333.671875 521.675781 335.847656 522.230469 338.03125 522.746094 C 340.21875 523.257812 342.414062 523.730469 344.621094 524.15625 C 346.824219 524.585938 349.035156 524.96875 351.257812 525.308594 C 353.476562 525.648438 355.703125 525.945312 357.933594 526.199219 C 360.164062 526.453125 362.398438 526.664062 364.640625 526.828125 C 366.878906 526.996094 369.121094 527.117188 371.367188 527.195312 C 373.609375 527.273438 375.855469 527.304688 378.101562 527.296875 C 380.347656 527.285156 382.59375 527.230469 384.835938 527.132812 C 387.078125 527.035156 389.320312 526.894531 391.558594 526.707031 C 393.796875 526.523438 396.03125 526.292969 398.257812 526.019531 C 400.488281 525.746094 402.710938 525.429688 404.929688 525.066406 C 407.144531 524.707031 409.355469 524.304688 411.554688 523.855469 C 413.753906 523.410156 415.945312 522.917969 418.128906 522.386719 C 420.308594 521.851562 422.480469 521.277344 424.640625 520.660156 C 426.796875 520.039062 428.945312 519.378906 431.078125 518.675781 C 433.210938 517.976562 435.328125 517.230469 437.433594 516.445312 C 439.539062 515.660156 441.625 514.835938 443.695312 513.96875 C 445.769531 513.101562 447.820312 512.191406 449.859375 511.246094 C 451.894531 510.296875 453.910156 509.308594 455.910156 508.28125 C 457.90625 507.257812 459.882812 506.191406 461.835938 505.085938 C 463.792969 503.980469 465.726562 502.839844 467.636719 501.660156 C 469.546875 500.480469 471.433594 499.261719 473.296875 498.007812 C 475.160156 496.753906 477 495.464844 478.8125 494.136719 C 480.625 492.8125 482.410156 491.449219 484.167969 490.054688 C 485.929688 488.660156 487.660156 487.230469 489.363281 485.765625 C 491.066406 484.300781 492.738281 482.804688 494.382812 481.273438 C 496.027344 479.746094 497.640625 478.183594 499.226562 476.589844 C 500.808594 474.996094 502.359375 473.375 503.878906 471.722656 C 505.398438 470.066406 506.886719 468.382812 508.339844 466.671875 C 509.792969 464.960938 511.210938 463.222656 512.597656 461.453125 C 513.984375 459.6875 515.332031 457.890625 516.648438 456.070312 C 517.964844 454.25 519.242188 452.40625 520.484375 450.535156 C 521.726562 448.664062 522.933594 446.769531 524.101562 444.851562 C 525.269531 442.933594 526.402344 440.992188 527.492188 439.03125 C 528.585938 437.070312 529.640625 435.085938 530.65625 433.082031 C 531.667969 431.078125 532.644531 429.058594 533.578125 427.015625 C 534.515625 424.972656 535.410156 422.914062 536.265625 420.835938 C 537.121094 418.761719 537.933594 416.667969 538.707031 414.558594 C 539.480469 412.449219 540.210938 410.328125 540.898438 408.191406 C 541.589844 406.050781 542.234375 403.902344 542.839844 401.738281 C 543.445312 399.578125 544.007812 397.402344 544.527344 395.21875 C 545.046875 393.03125 545.527344 390.839844 545.960938 388.636719 C 546.394531 386.433594 546.785156 384.222656 547.132812 382.003906 C 547.476562 379.78125 547.78125 377.558594 548.042969 375.328125 C 548.300781 373.097656 548.519531 370.863281 548.691406 368.621094 C 548.863281 366.382812 548.992188 364.140625 549.074219 361.898438 C 549.160156 359.652344 549.199219 357.410156 549.199219 355.164062 C 549.195312 352.917969 549.148438 350.671875 549.054688 348.429688 C 545.507812 257.757812 470.964844 184.894531 380.257812 183.34375 C 376.652344 183.28125 373.046875 183.332031 369.441406 183.496094 C 365.839844 183.660156 362.242188 183.9375 358.65625 184.328125 C 355.070312 184.722656 351.5 185.226562 347.949219 185.839844 C 344.394531 186.457031 340.863281 187.183594 337.351562 188.023438 C 333.84375 188.859375 330.367188 189.808594 326.917969 190.867188 C 323.46875 191.921875 320.054688 193.089844 316.679688 194.359375 C 313.304688 195.632812 309.972656 197.007812 306.683594 198.492188 C 303.394531 199.972656 300.15625 201.558594 296.96875 203.242188 C 293.777344 204.929688 290.644531 206.714844 287.570312 208.597656 C 284.492188 210.480469 281.476562 212.457031 278.527344 214.53125 C 275.574219 216.605469 272.691406 218.769531 269.875 221.023438 C 267.058594 223.277344 264.316406 225.617188 261.648438 228.046875 C 258.980469 230.472656 256.390625 232.980469 253.878906 235.574219 C 251.367188 238.164062 248.941406 240.828125 246.601562 243.574219 C 244.257812 246.316406 242.003906 249.128906 239.835938 252.015625 C 237.671875 254.898438 235.601562 257.851562 233.621094 260.867188 C 231.605469 263.972656 229.40625 266.941406 227.019531 269.777344 C 224.636719 272.609375 222.085938 275.289062 219.371094 277.804688 C 216.65625 280.324219 213.796875 282.664062 210.792969 284.828125 C 207.785156 286.992188 204.660156 288.960938 201.410156 290.738281 C 198.160156 292.515625 194.8125 294.085938 191.371094 295.445312 C 187.925781 296.808594 184.410156 297.953125 180.824219 298.878906 C 177.242188 299.804688 173.609375 300.507812 169.9375 300.984375 C 166.265625 301.460938 162.578125 301.710938 158.875 301.730469 L 156.5 301.730469 C 85.429688 301.730469 43.011719 222.890625 81.808594 163.359375 C 84.351562 159.441406 86.96875 155.578125 89.664062 151.765625 C 92.359375 147.953125 95.128906 144.195312 97.972656 140.496094 C 100.816406 136.792969 103.734375 133.148438 106.722656 129.5625 C 109.710938 125.976562 112.773438 122.453125 115.902344 118.988281 C 119.03125 115.523438 122.226562 112.121094 125.492188 108.785156 C 128.757812 105.449219 132.085938 102.175781 135.480469 98.972656 C 138.875 95.769531 142.332031 92.632812 145.851562 89.5625 C 149.371094 86.496094 152.949219 83.5 156.589844 80.574219 C 160.226562 77.648438 163.921875 74.796875 167.675781 72.019531 C 171.425781 69.242188 175.230469 66.539062 179.089844 63.914062 C 182.949219 61.285156 186.859375 58.738281 190.820312 56.265625 C 194.78125 53.792969 198.789062 51.402344 202.84375 49.089844 C 206.902344 46.777344 211 44.546875 215.144531 42.398438 C 219.289062 40.25 223.476562 38.183594 227.703125 36.199219 C 231.925781 34.21875 236.191406 32.320312 240.492188 30.503906 C 244.796875 28.691406 249.132812 26.964844 253.503906 25.324219 C 257.875 23.683594 262.273438 22.128906 266.707031 20.664062 C 271.140625 19.199219 275.597656 17.820312 280.085938 16.53125 C 284.574219 15.246094 289.085938 14.046875 293.621094 12.9375 C 298.152344 11.828125 302.707031 10.808594 307.285156 9.878906 C 311.859375 8.953125 316.453125 8.113281 321.058594 7.371094 C 325.667969 6.625 330.289062 5.96875 334.925781 5.410156 C 339.558594 4.847656 344.203125 4.375 348.855469 4 C 353.507812 3.621094 358.167969 3.335938 362.832031 3.144531 C 367.496094 2.953125 372.164062 2.855469 376.832031 2.847656 C 381.5 2.839844 386.167969 2.925781 390.832031 3.105469 C 395.496094 3.285156 400.15625 3.558594 404.8125 3.921875 C 409.464844 4.285156 414.109375 4.742188 418.746094 5.289062 C 423.382812 5.839844 428.007812 6.480469 432.617188 7.214844 C 437.226562 7.945312 441.820312 8.769531 446.398438 9.683594 C 450.976562 10.601562 455.535156 11.605469 460.074219 12.703125 C 464.609375 13.800781 469.125 14.984375 473.617188 16.261719 C 478.105469 17.539062 482.570312 18.902344 487.007812 20.355469 C 491.441406 21.808594 495.847656 23.351562 500.222656 24.980469 C 504.597656 26.609375 508.941406 28.324219 513.246094 30.125 C 517.554688 31.925781 521.824219 33.8125 526.054688 35.78125 C 530.289062 37.753906 534.480469 39.808594 538.628906 41.945312 C 542.78125 44.082031 546.886719 46.300781 550.949219 48.601562 C 555.011719 50.902344 559.023438 53.285156 562.992188 55.742188 C 566.960938 58.203125 570.878906 60.742188 574.742188 63.359375 C 578.609375 65.972656 582.421875 68.667969 586.183594 71.433594 C 589.941406 74.203125 593.644531 77.042969 597.292969 79.957031 C 600.9375 82.871094 604.527344 85.859375 608.054688 88.917969 C 611.582031 91.972656 615.046875 95.101562 618.453125 98.296875 C 621.855469 101.492188 625.195312 104.753906 628.46875 108.082031 C 631.742188 111.410156 634.949219 114.800781 638.085938 118.257812 C 641.226562 121.710938 644.296875 125.226562 647.296875 128.804688 C 650.292969 132.382812 653.222656 136.019531 656.078125 139.710938 C 658.929688 143.40625 661.710938 147.15625 664.417969 150.960938 C 667.121094 154.765625 669.753906 158.621094 672.304688 162.53125 C 674.855469 166.4375 677.332031 170.398438 679.726562 174.40625 C 682.121094 178.410156 684.433594 182.464844 686.667969 186.5625 C 688.902344 190.664062 691.054688 194.804688 693.125 198.992188 C 695.191406 203.175781 697.179688 207.398438 699.078125 211.664062 C 700.980469 215.925781 702.796875 220.226562 704.527344 224.5625 C 706.257812 228.898438 707.902344 233.265625 709.457031 237.667969 C 711.015625 242.070312 712.484375 246.5 713.863281 250.960938 C 715.246094 255.417969 716.535156 259.90625 717.738281 264.414062 C 718.941406 268.925781 720.054688 273.460938 721.074219 278.015625 C 722.097656 282.570312 723.027344 287.144531 723.867188 291.738281 C 724.707031 296.328125 725.457031 300.9375 726.113281 305.558594 C 726.769531 310.179688 727.335938 314.8125 727.808594 319.457031 C 728.28125 324.101562 728.664062 328.753906 728.949219 333.414062 C 729.238281 338.074219 729.433594 342.738281 729.535156 347.402344 Z M 729.535156 347.402344  " 
                    fillOpacity="1" 
                    fillRule="nonzero"
                  />
                </g>
              </g>
            </g>

            {/* শ্যাডো */}
            <ellipse className="animate-shadow-pulse fill-black/15 dark:fill-white/15" cx="156.5" cy="1135" rx="65" ry="12" />

            {/* কমলা ডট (ডাইনামিক প্রাইমারি কালার সাপোর্ট সহ) */}
            <g className="animate-jump">
              <g clipPath="url(#e724f3ca2c)">
                <g clipPath="url(#27ae62e6c2)">
                  <g transform="matrix(1, 0, 0, 1, 67, 791)">
                    <g clipPath="url(#c76e1fc440)">
                      <g clipPath="url(#bd5a1f1cc3)">
                        <g clipPath="url(#d12d5e9a15)">
                          {/* Tailwind এর প্রাইমারি কালার ব্যবহার করা হয়েছে */}
                          <path className="fill-primary" d="M 0.0898438 0.664062 L 178.96875 0.664062 L 178.96875 179.542969 L 0.0898438 179.542969 Z M 0.0898438 0.664062 " fillOpacity="1" fillRule="nonzero"/>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>

          </g>
        </g>
      </svg>
    </div>
    
    <p className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-gray-800 dark:text-gray-200 animate-pulse font-sans">
      Porikkhangon
    </p>
  </div>
);

const MainLayout: React.FC<{ 
  themeMode: 'light' | 'dark' | 'system', 
  toggleTheme: () => void,
  children: React.ReactNode,
}> = ({ themeMode, toggleTheme, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const lastScrollY = useRef(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isProfileComplete, profileLoading } = useAuth(); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
        if (!mainContentRef.current) return;
        const currentScrollY = mainContentRef.current.scrollTop;

        // Scroll logic preserved for lastScrollY update
        lastScrollY.current = currentScrollY;
    };

    const scrollContainer = mainContentRef.current;
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      const storedReads = localStorage.getItem('read_notifications_v2');
      if (storedReads) {
          try { 
            setReadNotificationIds(new Set(JSON.parse(storedReads))); 
          } catch (e) {
            console.error("Failed to parse notifications", e);
          }
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('read_notifications_v2', JSON.stringify(Array.from(readNotificationIds)));
  }, [readNotificationIds]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Check if already subscribed, if not, we can prompt later or auto-subscribe if permission exists
    const initPush = async () => {
      const isSubscribed = await checkSubscription();
      if (isSubscribed) {
        await subscribeToPushNotifications(currentUser);
      }
    };
    initPush();

    // Listen for foreground messages
    const unsubscribeForeground = onForegroundMessage((payload) => {
      // You can show a toast or update notifications state here
      console.log('Foreground message payload:', payload);
      if (payload.notification) {
        // Optionally add to notifications list
        const newNotif: Notification = {
          id: Date.now().toString(),
          title: payload.notification.title || 'New Notification',
          message: payload.notification.body || '',
          type: 'INFO',
          date: Date.now()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const loadNotifications = async () => {
       try {
         const allNotifs = await fetchNotificationsAPI();
         const userNotifs = allNotifs.filter(n => !n.target || n.target === 'ALL' || n.target === currentUser.uid);
         userNotifs.sort((a, b) => b.date - a.date);
         setNotifications(userNotifs);
       } catch (error) { console.error(error); }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  const isExamPage = location.pathname.startsWith('/exam/');
  const isPaymentPage = location.pathname.startsWith('/payment');
  const isBotPage = location.pathname === '/bot';
  const isLeaderboard = location.pathname === '/leaderboard';
  const isSavedQuestions = location.pathname === '/saved-questions';
  const isWrongQuestions = location.pathname === '/wrong-questions';
  const isQuizPage = location.pathname === '/quiz';
  const isQbankPage = location.pathname === '/qbank';
  const hideNav = isExamPage || isPaymentPage || isBotPage || isSavedQuestions || isWrongQuestions || isQuizPage;
  const hideTopNav = hideNav || isQbankPage;

  // Main tabs where back button should NOT appear
  const mainTabs = ['/dashboard', '/courses', '/bot', '/profile', '/planner', '/history', '/qbank'];
  const showBackButton = !mainTabs.includes(location.pathname) && location.pathname !== '/';

  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/profile/')) return 'Profile';
    if (pathname.startsWith('/exam/')) return 'Exam Active';
    if (pathname.startsWith('/payment')) return 'Checkout';
    if (pathname.startsWith('/battle')) return 'Battle Arena';
    switch (pathname) {
      case '/dashboard': return 'Porikkhangon';
      case '/exams': return 'Exam Zone';
      case '/quiz': return 'Quiz Zone';
      case '/admission': return 'Admission';
      case '/planner': return 'History';
      case '/history': return 'History';
      case '/courses': return 'Courses';
      case '/qbank': return 'Archives';
      case '/profile': return 'Profile';
      case '/leaderboard': return 'Rankings';
      case '/bot': return 'Porikkhangon AI';
      default: return 'Porikkhangon';
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/30">
      {!profileLoading && !isProfileComplete && !location.pathname.startsWith('/exam/') && <OnboardingModal />}

      {!hideNav && (
        <Navigation 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            themeMode={themeMode}
            toggleTheme={toggleTheme}
            notifications={notifications}
            readNotificationIds={readNotificationIds}
            setReadNotificationIds={setReadNotificationIds}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
        />
      )}

      <div className="flex-1 flex flex-col h-full relative w-full">
        {!hideTopNav && (
            <motion.div 
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                className={`md:hidden fixed top-0 left-0 right-0 z-[60] px-4 h-16 pt-safe-area flex items-center justify-between ${isLeaderboard ? 'bg-transparent' : 'bg-white dark:bg-gray-900 shadow-sm'}`}
            >
                {/* Left side: Back button and Notification */}
                <div className="flex items-center gap-1 z-10">
                    {!isLeaderboard && showBackButton && (
                        <button 
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                navigate(-1);
                            }} 
                            className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-600 dark:text-gray-300"
                        >
                            <ArrowLeft size={22} />
                        </button>
                    )}
                    {!isLeaderboard && (
                        <button 
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                setIsNotificationOpen(true);
                            }} 
                            className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-600 dark:text-gray-300 relative"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900"></span>}
                        </button>
                    )}
                </div>

                {/* Center: Logo or Title */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[50%] flex justify-center items-center pointer-events-none">
                    {!isLeaderboard && (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="pointer-events-auto"
                            >
                                {showBackButton ? (
                                    <span className="font-bold text-gray-800 dark:text-white text-lg tracking-tight line-clamp-1">
                                        {getTitle(location.pathname)}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-10 w-auto object-contain logo-dark-mode" />
                                        <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-6 w-auto object-contain logo-dark-mode" />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
                
                {/* Right side: Menu button */}
                <div className="flex items-center justify-end z-10">
                    {!isLeaderboard && (
                        <button 
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                setIsMobileMenuOpen(true);
                            }} 
                            className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-600 dark:text-gray-300"
                        >
                            <Menu size={22} />
                        </button>
                    )}
                </div>
            </motion.div>
        )}

        <main 
            ref={mainContentRef}
            className={`flex-1 transition-colors relative scroll-smooth ${
              (isQuizPage || isExamPage || isBotPage || isPaymentPage) 
                ? 'h-full overflow-hidden flex flex-col p-0' 
                : `overflow-y-auto overflow-x-hidden ${hideNav ? 'p-0' : `${(isLeaderboard || isQbankPage) ? 'pt-0' : 'pt-16'} pb-[calc(80px+env(safe-area-inset-bottom))] md:pt-6 md:pb-6 md:px-6`}`
            }`}
        >
          {/* Key on location.pathname forces a re-render/animation on route change */}
          <AnimatePresence mode="wait">
            <motion.div 
                key={location.pathname} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
                <Suspense fallback={<PageLoader />}>
                    {children}
                </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  // @ts-ignore
  const from = location.state?.from?.pathname || "/dashboard";

  if (currentUser && !currentUser.isAnonymous) {
    return <Navigate to={from} replace />;
  }
  return children;
};

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      return (saved as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  // Use location hook here to pass to Navigate
  // We need to wrap Routes in a component to use useLocation, but App is already inside HashRouter?
  // No, App contains HashRouter. So we cannot use useLocation in App directly if it's outside Router.
  // Wait, App returns HashRouter. So we cannot use useLocation at the top level of App.
  
  // We need to move the routing logic into a child component or handle it differently.
  // Actually, the Navigate is inside Routes -> Route -> element.
  // The element prop is evaluated.
  // But to access 'location' to pass to state, we need to be inside a Router context.
  
  // Refactoring App to split Router and Content.
  
  useEffect(() => {
    const applyTheme = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark);
      if (shouldBeDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyTheme();
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary">
        <PageLoader />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AdminProvider>
        <HashRouter>
          <ErrorBoundary>
             <Suspense fallback={<PageLoader />}>
                <AppRoutes themeMode={themeMode} toggleTheme={toggleTheme} currentUser={currentUser} />
             </Suspense>
          </ErrorBoundary>
        </HashRouter>
      </AdminProvider>
    </LanguageProvider>
  );
};

const AppRoutes: React.FC<{
    themeMode: 'light' | 'dark' | 'system';
    toggleTheme: () => void;
    currentUser: any;
}> = ({ themeMode, toggleTheme, currentUser }) => {
    const location = useLocation();
    const { profileLoading } = useAuth();

    if (profileLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <PageLoader />
            </div>
        );
    }

    return (
          <Routes>
            <Route path="/" element={!currentUser ? <LandingPage onLoginClick={() => window.location.hash = '#/auth'} /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={<AuthRoute><AuthPage onBack={() => window.location.hash = '#/'} /></AuthRoute>} />
            
            {/* Public Exam Route - Accessible to guests */}
            <Route path="/exam/:examId" element={<ExamPage />} />

            <Route path="/*" element={
              currentUser ? (
                <MainLayout themeMode={themeMode} toggleTheme={toggleTheme}>
                    <Routes location={location}>
                      <Route path="/dashboard" element={<HomeDashboard />} />
                      <Route path="/courses" element={<CourseSection />} />
                      <Route path="/qbank" element={<QuestionBank />} />
                      <Route path="/exams" element={<ExamHub />} />
                      <Route path="/quiz" element={<QuizArena />} />
                      {/* ExamPage removed from here as it is now top-level */}
                      <Route path="/battle" element={<QuizBattlePrototype />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/planner" element={<ExamHistory />} />
                      <Route path="/history" element={<ExamHistory />} />
                      <Route path="/admission" element={<AdmissionSearch />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/:userId" element={<ProfilePage />} />
                      <Route path="/saved-questions" element={<SavedQuestions />} />
                      <Route path="/wrong-questions" element={<WrongQuestions />} />
                      <Route path="/settings" element={<ProfilePage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/challenges" element={<DailyChallengePage openBot={() => {}} />} />
                      <Route path="/bot" element={<PorikkhangonAI />} />
                      <Route path="/exam-batch/:courseId" element={<ExamBatchPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            } />
          </Routes>
    );
}

export default App;
