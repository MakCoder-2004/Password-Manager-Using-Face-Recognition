import cv2
import numpy as np
import os
import torch
import onnxruntime as ort
import time
import warnings
from torchvision import transforms
from insightface.app import FaceAnalysis

# Suppress scikit-image deprecation warning from insightface
warnings.filterwarnings('ignore', category=FutureWarning, module='insightface')

# ==========================
# Initialize InsightFace
# ==========================

available_providers = ort.get_available_providers()

# Prefer GPU when available, otherwise keep CPU as a safe fallback.
providers = ["CPUExecutionProvider"]
ctx_id = -1

if "CUDAExecutionProvider" in available_providers:
    providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    ctx_id = 0

# InsightFace expects root to contain a "models" folder (root/models/buffalo_l).
model_root = os.path.abspath(os.path.dirname(__file__))

try:
    # Load models from the local project models folder.
    app = FaceAnalysis(
        name="buffalo_l",
        root=model_root,
        providers=providers,
        download=False  # Use pre-downloaded models only
    )
    app.prepare(ctx_id=ctx_id, det_size=(640, 640))
    print(f"InsightFace providers: {providers}")
    print(f"Models loaded from: {model_root}")
except Exception as ex:
    # If GPU init fails, force CPU so the app still runs.
    print(f"Model loading failed ({ex}). Falling back to CPU.")
    app = FaceAnalysis(
        name="buffalo_l",
        root=model_root,
        providers=["CPUExecutionProvider"],
        download=False
    )
    app.prepare(ctx_id=-1, det_size=(640, 640))

# ==========================
# Database
# ==========================

DB_PATH = "face_db"

if not os.path.exists(DB_PATH):
    os.makedirs(DB_PATH)

# ==========================
# Anti Spoof Model
# ==========================

class MiniFASNet(torch.nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, x):
        return x

spoof_model = MiniFASNet()
spoof_model.eval()

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((80, 80)),
    transforms.ToTensor()
])

# ==========================
# Utility Functions
# ==========================

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def load_database():

    database = {}

    for file in os.listdir(DB_PATH):

        path = os.path.join(DB_PATH, file)

        emb = np.load(path)

        name = file.replace(".npy", "")

        database[name] = emb

    return database


def save_face(name, embedding):

    path = os.path.join(DB_PATH, name + ".npy")

    np.save(path, embedding)


def anti_spoof(face_img):

    face = transform(face_img).unsqueeze(0)

    with torch.no_grad():

        pred = spoof_model(face)

    score = pred.mean().item()

    if score > 0.5:
        return False
    else:
        return True


# ==========================
# Webcam
# ==========================

cap = cv2.VideoCapture(0)

database = load_database()

prev_time = time.time()
fps = 0

while True:

    ret, frame = cap.read()

    if not ret:
        break

    curr_time = time.time()
    fps = 1 / (curr_time - prev_time) if (curr_time - prev_time) > 0 else 0
    prev_time = curr_time

    faces = app.get(frame)

    status = "No Face"

    for face in faces:

        bbox = face.bbox.astype(int)

        x1, y1, x2, y2 = bbox

        face_img = frame[y1:y2, x1:x2]

        if face_img.size == 0:
            continue

        # ==========================
        # Anti Spoof
        # ==========================

        real = anti_spoof(face_img)

        if not real:

            status = "Spoof Detected"

            color = (0,0,255)

            cv2.rectangle(frame,(x1,y1),(x2,y2),color,2)

            cv2.putText(frame,status,(x1,y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX,0.6,color,2)

            continue

        # ==========================
        # Face Recognition
        # ==========================

        embedding = face.embedding

        best_score = 0
        best_name = "Unknown"

        for name, db_emb in database.items():

            score = cosine_similarity(embedding, db_emb)

            if score > best_score:

                best_score = score
                best_name = name

        if best_score > 0.45:

            status = f"Authenticated: {best_name}"

            color = (0,255,0)

        else:

            status = "Unauthenticated"

            color = (0,0,255)

        cv2.rectangle(frame,(x1,y1),(x2,y2),color,2)

        cv2.putText(frame,status,(x1,y1-10),
                    cv2.FONT_HERSHEY_SIMPLEX,0.6,color,2)

    # Display FPS on the frame
    cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.imshow("Face Authentication", frame)

    key = cv2.waitKey(1)

    # ==========================
    # Enroll Face
    # ==========================

    if key == ord('e') and len(faces)>0:

        name = input("Enter name: ")

        emb = faces[0].embedding

        save_face(name, emb)

        database = load_database()

        print("Face enrolled!")

    # ==========================
    # Quit
    # ==========================

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()