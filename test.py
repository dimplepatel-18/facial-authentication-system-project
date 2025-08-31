import dlib
import face_recognition

print('working')

image_path = 'C:\\Users\\dimpl\\Downloads\\LookLogin\\uploads\\elon.jpeg'  # replace with your image path
img = face_recognition.load_image_file(image_path)
encodings = face_recognition.face_encodings(img)

if encodings:
    print("Face detected!")
else:
    print("No face detected.")